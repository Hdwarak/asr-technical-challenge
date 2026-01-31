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
      // PATCH should never be called for validation failure
      if (options?.method === "PATCH") {
        return Promise.reject(new Error("PATCH should not be called"));
      }

      // Initial GET
      return Promise.resolve({
        ok: true,
        json: async () => [sampleRecord],
      } as Response);
    }) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prevents persistence when validation fails (missing note)", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecordsProvider>{children}</RecordsProvider>
    );

    const { result } = renderHook(() => useRecords(), { wrapper });

    await waitFor(() => {
      expect(result.current.records.length).toBe(1);
    });

    // initial state
    expect(result.current.records[0].status).toBe("pending");

    // attempt invalid update (flagged requires a note)
    await act(async () => {
      try {
        await result.current.updateRecord("1", {
          status: "flagged",
          // note intentionally omitted
        });
      } catch {
        // expected: validation should fail
      }
    });

    // record should remain unchanged
    expect(result.current.records[0].status).toBe("pending");
    expect(result.current.records[0].note).toBeUndefined();

    // no history should be written
    expect(result.current.history).toHaveLength(0);

    // error should be present
    expect(result.current.error).toBeTruthy();
  });
});
