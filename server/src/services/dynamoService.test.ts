import { mockAwsServices, mockDocClientSend } from "./__mocks__/awsServices";
import { DynamoService } from "./dynamoService";
import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

describe("DynamoService", () => {
  let dynamoService: DynamoService;

  beforeEach(() => {
    dynamoService = new DynamoService(mockAwsServices);
    jest.clearAllMocks();
  });

  describe("saveMetadata", () => {
    it("should save metadata correctly", async () => {
      const metadata = {
        id: "123",
        title: "Test Video",
        originalFileName: "test.mp4",
        s3Key: "uploads/test.mp4",
        uploadDate: "2024-01-05",
      };

      await dynamoService.saveMetadata(metadata);

      expect(mockAwsServices.docClient.send).toHaveBeenCalledWith(
        expect.any(PutCommand)
      );

      const putCommand = (mockAwsServices.docClient.send as jest.Mock).mock
        .calls[0][0];
      expect(putCommand.input).toEqual({
        TableName: "silkstream-vids",
        Item: metadata,
      });
    });

    it("should throw error if save fails", async () => {
      const error = new Error("DynamoDB error");
      mockDocClientSend.mockRejectedValueOnce(error);

      const metadata = {
        id: "123",
        title: "Test Video",
        originalFileName: "test.mp4",
        s3Key: "uploads/test.mp4",
        uploadDate: "2024-01-05",
      };

      await expect(dynamoService.saveMetadata(metadata)).rejects.toThrow(
        "DynamoDB error"
      );
    });
  });

  describe("getMetadata", () => {
    it("should retrieve metadata correctly", async () => {
      const mockMetadata = {
        id: "123",
        title: "Test Video",
      };

      mockDocClientSend.mockResolvedValueOnce({
        Item: mockMetadata,
      });

      const result = await dynamoService.getMetadata("123");

      expect(mockAwsServices.docClient.send).toHaveBeenCalledWith(
        expect.any(GetCommand)
      );
      expect(result.Item).toEqual(mockMetadata);
    });
  });

  describe("updateMetadata", () => {
    it("should update metadata with correct expression", async () => {
      const updates = {
        title: "Updated Title",
        description: "New description",
      };

      await dynamoService.updateMetadata("123", updates);

      expect(mockAwsServices.docClient.send).toHaveBeenCalledWith(
        expect.any(UpdateCommand)
      );

      const updateCommand = (mockAwsServices.docClient.send as jest.Mock).mock
        .calls[0][0];
      expect(updateCommand.input).toMatchObject({
        TableName: "silkstream-vids",
        Key: { id: "123" },
        UpdateExpression: expect.stringContaining("set"),
        ExpressionAttributeNames: {
          "#title": "title",
          "#description": "description",
        },
        ExpressionAttributeValues: {
          ":title": "Updated Title",
          ":description": "New description",
        },
      });
    });
  });
});
