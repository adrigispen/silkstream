// src/services/s3Service.test.ts
import { S3Service } from "./s3Service";
import { mockAwsServices, mockS3Send } from "./__mocks__/awsServices";
import {
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Mock the getSignedUrl function
jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn(),
}));

describe("S3Service", () => {
  let s3Service: S3Service;
  const mockGetSignedUrl = getSignedUrl as jest.Mock;

  beforeEach(() => {
    s3Service = new S3Service(mockAwsServices);
    jest.clearAllMocks();
  });

  describe("getSignedUploadUrl", () => {
    it("should generate signed upload URL", async () => {
      const mockUrl = "https://fake-signed-url.com";
      mockGetSignedUrl.mockResolvedValueOnce(mockUrl);

      const result = await s3Service.getSignedUploadUrl(
        "test-key.mp4",
        "video/mp4"
      );

      expect(getSignedUrl).toHaveBeenCalledWith(
        mockAwsServices.s3Client,
        expect.any(PutObjectCommand),
        { expiresIn: 3600 }
      );

      const putCommand = mockGetSignedUrl.mock.calls[0][1];
      expect(putCommand.input).toEqual({
        Bucket: "test-bucket",
        Key: "test-key.mp4",
        ContentType: "video/mp4",
      });

      expect(result).toBe(mockUrl);
    });
  });

  describe("listS3Objects", () => {
    it("should list objects from S3", async () => {
      const mockObjects = {
        Contents: [
          { Key: "test1.mp4", LastModified: new Date(), Size: 1024 },
          { Key: "test2.mp4", LastModified: new Date(), Size: 2048 },
        ],
      };

      mockS3Send.mockResolvedValueOnce(mockObjects);

      const result = await s3Service.listS3Objects();

      expect(mockAwsServices.s3Client.send).toHaveBeenCalledWith(
        expect.any(ListObjectsV2Command)
      );

      const listCommand = mockS3Send.mock.calls[0][0];
      expect(listCommand.input).toEqual({
        Bucket: "test-bucket",
        Prefix: "uploads/",
      });

      expect(result).toEqual(mockObjects);
    });

    it("should handle listing errors", async () => {
      const error = new Error("S3 listing error");
      mockS3Send.mockRejectedValueOnce(error);

      await expect(s3Service.listS3Objects()).rejects.toThrow(
        "S3 listing error"
      );
    });
  });

  describe("getSignedDownloadUrl", () => {
    it("should generate signed download URL", async () => {
      const mockUrl = "https://fake-download-url.com";
      mockGetSignedUrl.mockResolvedValueOnce(mockUrl);

      const result = await s3Service.getSignedDownloadUrl("test-key.mp4");

      expect(getSignedUrl).toHaveBeenCalledWith(
        mockAwsServices.s3Client,
        expect.any(GetObjectCommand),
        { expiresIn: 3600 }
      );

      const getCommand = mockGetSignedUrl.mock.calls[0][1];
      expect(getCommand.input).toEqual({
        Bucket: "test-bucket",
        Key: "test-key.mp4",
      });

      expect(result).toBe(mockUrl);
    });
  });
});
