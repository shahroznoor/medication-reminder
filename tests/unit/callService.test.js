const { makeCall } = require("../../services/callService");
const twilio = require("twilio");

jest.mock("twilio");
jest.mock("../../utils/logger");

describe("Call Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("makeCall", () => {
    it("should successfully initiate a call", async () => {
      const mockCall = { sid: "test123" };
      twilio.mockImplementation(() => ({
        calls: {
          create: jest.fn().mockResolvedValue(mockCall),
        },
      }));

      const callSid = await makeCall("+1234567890", ["Aspirin"]);
      expect(callSid).toBe("test123");
    });

    it("should handle errors when making a call", async () => {
      twilio.mockImplementation(() => ({
        calls: {
          create: jest.fn().mockRejectedValue(new Error("Call failed")),
        },
      }));

      await expect(makeCall("+1234567890", ["Aspirin"])).rejects.toThrow(
        "Call failed"
      );
    });
  });
});
