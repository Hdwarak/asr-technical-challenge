import { renderHook, act, waitFor } from "@testing-library/react";
import { RecordsProvider, useRecords } from "@/app/interview/context/RecordsContext";
import type { RecordItem } from "@/app/interview/types";

const sampleRecord: RecordItem = {
  id: "1",
  name: "Specimen A",
  description: "Collected near river bank",
  status: "pending",
};

describe("RecordsContext", () => {
  beforeEach(() => {
    global.fetch = vi.fn((_, options) => {
      if (options?.method === "PATCH") {
        const body = JSON.parse(options.body as string);
        return Promise.resolve({
          ok: true,
          json: async () => body,
        } as Response);
      }

      return Promise.resolve({
        ok: true,
        json: async () => [sampleRecord],
      } as Response);
    }) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("updates record status and records history on successful update", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecordsProvider>{children}</RecordsProvider>
    );

    const { result } = renderHook(() => useRecords(), { wrapper });

    await waitFor(() => {
      expect(result.current.records.length).toBe(1);
    });

    expect(result.current.records[0].status).toBe("pending");

    await act(async () => {
      await result.current.updateRecord("1", {
        status: "approved",
        note: "Looks good",
      });
    });

    const updatedRecord = result.current.records[0];

    expect(updatedRecord.status).toBe("approved");
    expect(updatedRecord.note).toBe("Looks good");

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0]).toMatchObject({
      id: "1",
      previousStatus: "pending",
      newStatus: "approved",
      note: "Looks good",
    });

    expect(result.current.error).toBeNull();
  });
});
