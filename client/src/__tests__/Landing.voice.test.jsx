import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Landing from "../pages/Landing";

const renderLanding = () =>
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Landing />
    </MemoryRouter>
  );

describe("Landing voice preview", () => {
  let originalSpeechSynthesis;
  let originalUtterance;
  let utterances;
  let speechSynthesisMock;

  beforeEach(() => {
    utterances = [];

    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => ({
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      set fillStyle(_value) {},
      set strokeStyle(_value) {},
    }));

    jest.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    originalSpeechSynthesis = window.speechSynthesis;
    originalUtterance = global.SpeechSynthesisUtterance;

    speechSynthesisMock = {
      getVoices: jest.fn(() => [
        { name: "Samantha", lang: "en-US" },
      ]),
      speak: jest.fn((utterance) => {
        utterances.push(utterance);
      }),
      cancel: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      writable: true,
      value: speechSynthesisMock,
    });

    global.SpeechSynthesisUtterance = function MockUtterance(text) {
      this.text = text;
      this.voice = null;
      this.lang = "en-US";
      this.rate = 1;
      this.pitch = 1;
      this.volume = 1;
      this.onend = null;
      this.onerror = null;
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();

    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      writable: true,
      value: originalSpeechSynthesis,
    });

    global.SpeechSynthesisUtterance = originalUtterance;
  });

  test("play then pause updates demo state", () => {
    renderLanding();

    const button = screen.getByRole("button", { name: /hear ai in action/i });
    fireEvent.click(button);

    expect(screen.getByText(/playing ai demo/i)).toBeInTheDocument();
    expect(speechSynthesisMock.speak).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /playing ai demo/i }));

    expect(speechSynthesisMock.cancel).toHaveBeenCalled();
    expect(screen.getByText(/ai demo paused/i)).toBeInTheDocument();
  });

  test("play then finish shows replay message", () => {
    renderLanding();

    fireEvent.click(screen.getByRole("button", { name: /hear ai in action/i }));

    expect(utterances.length).toBeGreaterThan(0);

    act(() => {
      utterances[0].onend?.();
    });

    expect(screen.getByText(/ai demo finished\. tap again to replay\./i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hear ai in action/i })).toBeInTheDocument();
  });

  test("play with fallback and final error shows guidance once", () => {
    renderLanding();

    fireEvent.click(screen.getByRole("button", { name: /hear ai in action/i }));

    expect(utterances.length).toBe(1);

    act(() => {
      utterances[0].onerror?.();
    });

    expect(utterances.length).toBe(2);

    act(() => {
      utterances[1].onerror?.();
    });

    expect(screen.getByText(/couldn't play ai voice preview\. please try chrome or edge\./i)).toBeInTheDocument();
  });
});
