import { expect, test as it, describe } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import AnalyticsDataRange from "../AnalyticsDataRange";

describe("AnalyticsDataRange", () => {
  it("renderiza los inputs y el botón", () => {
    const mockOnDateChange = vi.fn();
    render(<AnalyticsDataRange onDateChange={mockOnDateChange} />);

    expect(screen.getByLabelText(/fecha inicio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha fin/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar/i })).toBeInTheDocument();
  });

  it("permite escribir fechas en los inputs", () => {
    const mockOnDateChange = vi.fn();
    render(<AnalyticsDataRange onDateChange={mockOnDateChange} />);

    const startInput = screen.getByLabelText(/fecha inicio/i);
    const endInput = screen.getByLabelText(/fecha fin/i);

    fireEvent.change(startInput, { target: { value: "2024-01-01" } });
    fireEvent.change(endInput, { target: { value: "2024-01-31" } });

    expect(startInput.value).toBe("2024-01-01");
    expect(endInput.value).toBe("2024-01-31");
  });

  it("llama a onDateChange con las fechas seleccionadas al enviar", () => {
    const mockOnDateChange = vi.fn();
    render(<AnalyticsDataRange onDateChange={mockOnDateChange} />);

    const startInput = screen.getByLabelText(/fecha inicio/i);
    const endInput = screen.getByLabelText(/fecha fin/i);
    const submitBtn = screen.getByRole("button", { name: /enviar/i });

    fireEvent.change(startInput, { target: { value: "2024-01-01" } });
    fireEvent.change(endInput, { target: { value: "2024-01-31" } });

    fireEvent.click(submitBtn);

    expect(mockOnDateChange).toHaveBeenCalledWith("2024-01-01", "2024-01-31");
  });
});
