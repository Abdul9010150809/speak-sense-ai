import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Signup from "../pages/Signup";
import API from "../services/api";

const mockNavigate = jest.fn();

jest.mock("../services/api", () => ({
  __esModule: true,
  default: {
    post: jest.fn()
  }
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe("Signup social auth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GitHub signup calls social endpoint with expected payload shape", async () => {
    API.post.mockResolvedValue({
      data: {
        token: "demo-token",
        user: { id: "u1", name: "GitHub Demo User", email: "demo.github@speaksense.ai" }
      }
    });

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Signup />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /github/i }));

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith("/auth/social", {
        provider: "github",
        mode: "demo"
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
});
