import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SignIn from "../SignIn";

const loginUserMock = vi.fn();
const navigateMock = vi.fn();

vi.mock("../../components/Navbar", () => ({
	default: () => <div>Navbar</div>,
}));

vi.mock("../../context/AppContext", () => ({
	useApp: () => ({
		loginUser: loginUserMock,
	}),
}));

vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

describe("SignIn page", () => {
	beforeEach(() => {
		loginUserMock.mockReset();
		navigateMock.mockReset();
		vi.spyOn(window, "alert").mockImplementation(() => {});
	});

	afterEach(() => {
		window.alert.mockRestore();
	});

	it("navigates to the student dashboard on successful student login", async () => {
		loginUserMock.mockReturnValue({
			ok: true,
			user: { role: "student" },
		});

		const user = userEvent.setup();

		render(
			<MemoryRouter>
				<SignIn />
			</MemoryRouter>,
		);

		await user.type(
			screen.getByPlaceholderText("Enter your email"),
			"pelumi@slu.edu",
		);
		await user.type(
			screen.getByPlaceholderText("Enter your password"),
			"secret123",
		);

		await user.click(screen.getByRole("button", { name: /sign in/i }));

		expect(loginUserMock).toHaveBeenCalledWith({
			email: "pelumi@slu.edu",
			password: "secret123",
		});
		expect(navigateMock).toHaveBeenCalledWith("/student-dashboard");
	});

	it("shows error when login credentials are invalid", async () => {
		loginUserMock.mockReturnValue({ ok: false });

		const user = userEvent.setup();

		render(
			<MemoryRouter>
				<SignIn />
			</MemoryRouter>,
		);

		await user.type(
			screen.getByPlaceholderText("Enter your email"),
			"wrong@slu.edu",
		);
		await user.type(
			screen.getByPlaceholderText("Enter your password"),
			"wrongpass",
		);

		await user.click(screen.getByRole("button", { name: /sign in/i }));

		expect(window.alert).toHaveBeenCalled();
	});

	it("navigates to tutor dashboard when tutor logs in", async () => {
		loginUserMock.mockReturnValue({
			ok: true,
			user: { role: "tutor" },
		});

		const user = userEvent.setup();

		render(
			<MemoryRouter>
				<SignIn />
			</MemoryRouter>,
		);

		await user.type(
			screen.getByPlaceholderText("Enter your email"),
			"tutor@slu.edu",
		);
		await user.type(
			screen.getByPlaceholderText("Enter your password"),
			"secret123",
		);

		await user.click(screen.getByRole("button", { name: /sign in/i }));

		expect(navigateMock).toHaveBeenCalledWith("/tutor-dashboard");
	});
});
