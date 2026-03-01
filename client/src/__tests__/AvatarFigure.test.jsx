import React from "react";
import { render, screen } from "@testing-library/react";
import AvatarFigure from "../pages/AvatarFigure";

const baseAvatar = {
  name: "Alex",
  gender: "male",
  role: "Technical Interviewer",
  color: "#4f9eff"
};

describe("AvatarFigure posture", () => {
  test("uses idle posture class by default", () => {
    const { container } = render(<AvatarFigure avatar={baseAvatar} isSpeaking={false} />);
    expect(container.querySelector(".avatar-figure-wrapper.avatar-idle")).toBeInTheDocument();
  });

  test("uses speaking posture class and shows speaking ring when speaking", () => {
    const { container } = render(<AvatarFigure avatar={baseAvatar} isSpeaking={true} posture="thinking" />);
    expect(container.querySelector(".avatar-figure-wrapper.avatar-speaking")).toBeInTheDocument();
    expect(container.querySelector(".avatar-speak-ring")).toBeInTheDocument();
  });

  test("uses requested posture class when not speaking", () => {
    const { container, rerender } = render(
      <AvatarFigure avatar={baseAvatar} isSpeaking={false} posture="thinking" />
    );
    expect(container.querySelector(".avatar-figure-wrapper.avatar-thinking")).toBeInTheDocument();

    rerender(<AvatarFigure avatar={baseAvatar} isSpeaking={false} posture="nodding" />);
    expect(container.querySelector(".avatar-figure-wrapper.avatar-nodding")).toBeInTheDocument();
  });

  test("renders accessible avatar label", () => {
    render(<AvatarFigure avatar={baseAvatar} isSpeaking={false} />);
    expect(screen.getByLabelText(/alex avatar/i)).toBeInTheDocument();
  });
});
