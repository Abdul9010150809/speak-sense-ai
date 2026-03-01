import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { act } from "react";
import Interview from "../pages/Interview";
import API from "../services/api";

jest.mock("../services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn()
  }
}));

const renderInterview = () =>
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Interview />
    </MemoryRouter>
  );

const createDeferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

jest.setTimeout(15000);

describe("Interview posture integration", () => {
  let now;

  beforeEach(() => {
    jest.useFakeTimers();
    API.get.mockResolvedValue({ data: { user: null } });
    API.post.mockReset();
    now = 1700000000000;
    jest.spyOn(Date, "now").mockImplementation(() => {
      now += 1;
      return now;
    });
    Object.defineProperty(global.navigator, "mediaDevices", {
      value: {
        getUserMedia: jest.fn().mockRejectedValue(new Error("No media"))
      },
      configurable: true
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test("transitions avatar posture thinking -> nodding -> speaking during chat flow", async () => {
    const chatDeferred = createDeferred();

    API.post.mockImplementation((url) => {
      if (url === "/interview/start") {
        return Promise.resolve({
          data: { message: "Hello! Let's begin your interview." }
        });
      }
      if (url === "/interview/chat") {
        return chatDeferred.promise;
      }
      if (url === "/interview/analyze") {
        return Promise.resolve({
          data: {
            grammarIssues: [],
            improvements: [],
            topics: ["Interview Communication Skills"],
            stats: { score: 85, wordCount: 8, sentenceCount: 1, avgWordsPerSentence: 8 }
          }
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const { container } = renderInterview();

    fireEvent.click(screen.getAllByRole("button", { name: /start interview/i })[0]);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByPlaceholderText(/type your response/i)).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(2500);
    });

    const input = screen.getByPlaceholderText(/type your response/i);
    fireEvent.change(input, { target: { value: "I solved a critical production issue under pressure." } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(container.querySelector(".avatar-figure-wrapper.avatar-thinking")).toBeInTheDocument();

    await act(async () => {
      chatDeferred.resolve({
        data: {
          response: "Thanks. Can you describe your debugging approach in more detail?",
          isComplete: false
        }
      });
      await Promise.resolve();
    });

    expect(container.querySelector(".avatar-figure-wrapper.avatar-nodding")).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    expect(container.querySelector(".avatar-figure-wrapper.avatar-speaking")).toBeInTheDocument();
  });

  test("shows fallback response and transitions thinking -> speaking when chat API fails", async () => {
    const chatDeferred = createDeferred();

    API.post.mockImplementation((url) => {
      if (url === "/interview/start") {
        return Promise.resolve({
          data: { message: "Hello! Let's begin your interview." }
        });
      }
      if (url === "/interview/chat") {
        return chatDeferred.promise;
      }
      if (url === "/interview/analyze") {
        return Promise.resolve({
          data: {
            grammarIssues: [],
            improvements: [],
            topics: ["Interview Communication Skills"],
            stats: { score: 82, wordCount: 9, sentenceCount: 1, avgWordsPerSentence: 9 }
          }
        });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const { container } = renderInterview();

    fireEvent.click(screen.getAllByRole("button", { name: /start interview/i })[0]);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByPlaceholderText(/type your response/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/type your response/i);
    fireEvent.change(input, { target: { value: "I improved our system reliability." } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(container.querySelector(".avatar-figure-wrapper.avatar-thinking")).toBeInTheDocument();

    await act(async () => {
      chatDeferred.reject(new Error("chat failed"));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getAllByText("I'm having a little trouble. Please continue.").length).toBeGreaterThan(0);
    });

    const speakingOrListening = container.querySelector(
      ".avatar-figure-wrapper.avatar-speaking, .avatar-figure-wrapper.avatar-listening"
    );
    expect(speakingOrListening).toBeInTheDocument();
    expect(container.querySelector(".avatar-figure-wrapper.avatar-nodding")).not.toBeInTheDocument();
  });
});
