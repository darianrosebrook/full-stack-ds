import { afterEach, describe, expect, it, vi } from "vitest";
import { Logger } from "./logger.js";

afterEach(() => {
  vi.restoreAllMocks();
  Logger.setLevel("warn");
});

describe("Logger level gating", () => {
  it("suppresses debug and info at the default warn level", () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    Logger.debug("d");
    Logger.info("i");
    Logger.warn("w");
    Logger.error("e");

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith("[WARN]", "w");
    expect(errorSpy).toHaveBeenCalledWith("[ERROR]", "e");
  });

  it("passes everything through at debug level", () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    Logger.setLevel("debug");
    Logger.debug("d");
    Logger.info("i");
    Logger.warn("w");
    Logger.error("e");

    expect(debugSpy).toHaveBeenCalledWith("[DEBUG]", "d");
    expect(infoSpy).toHaveBeenCalledWith("[INFO]", "i");
    expect(warnSpy).toHaveBeenCalledWith("[WARN]", "w");
    expect(errorSpy).toHaveBeenCalledWith("[ERROR]", "e");
  });

  it("emits only errors at error level", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    Logger.setLevel("error");
    Logger.warn("w");
    Logger.error("e");

    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith("[ERROR]", "e");
  });

  it("suppresses everything at silent level, including timers", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const timeSpy = vi.spyOn(console, "time").mockImplementation(() => {});
    const timeEndSpy = vi
      .spyOn(console, "timeEnd")
      .mockImplementation(() => {});

    Logger.setLevel("silent");
    Logger.error("e");
    Logger.timeStart("t");
    Logger.timeEnd("t");

    expect(errorSpy).not.toHaveBeenCalled();
    expect(timeSpy).not.toHaveBeenCalled();
    expect(timeEndSpy).not.toHaveBeenCalled();
  });
});

describe("Logger timers", () => {
  it("starts and ends timers at warn level", () => {
    const timeSpy = vi.spyOn(console, "time").mockImplementation(() => {});
    const timeEndSpy = vi
      .spyOn(console, "timeEnd")
      .mockImplementation(() => {});

    Logger.timeStart("op");
    Logger.timeEnd("op");

    expect(timeSpy).toHaveBeenCalledWith("op");
    expect(timeEndSpy).toHaveBeenCalledWith("op");
  });
});
