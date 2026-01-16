import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js";
import fs from "fs/promises";

export async function multipartUpload(
  filePath,
  bucket,
  key,
  partSize = 500 * 1024 * 1024
) {
  const stat = await fs.stat(filePath);
  const totalSize = stat.size;

  const createRes = await s3.send(
    new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      ContentType: "video/mp4",
    })
  );

  const uploadId = createRes.UploadId;
  const parts = [];
  const fd = await fs.open(filePath, "r");
  let partNumber = 1;
  let start = 0;

  try {
    while (start < totalSize) {
      const end = Math.min(start + partSize, totalSize);
      const buffer = Buffer.alloc(end - start);
      await fd.read(buffer, 0, end - start, start);

      const uploadRes = await s3.send(
        new UploadPartCommand({
          Bucket: bucket,
          Key: key,
          PartNumber: partNumber,
          UploadId: uploadId,
          Body: buffer,
        })
      );

      parts.push({ ETag: uploadRes.ETag, PartNumber: partNumber });
      start = end;
      partNumber += 1;
    }

    await s3.send(
      new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      })
    );
  } finally {
    await fd.close();
  }
}
