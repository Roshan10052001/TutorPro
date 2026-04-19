import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "../../context";
import SignIn from "../SignIn";

const loginMutateAsyncMock = vi.fn();
const navigateMock = vi.fn();
const authenticateMock = vi.fn();

vi.mock("../../components/Navbar", () => ({
	default: () => <div>Navbar</div>,
}));

vi.mock("../../hooks/auth", () => ({
	useLogin: () => ({
		mutateAsync: loginMutateAsyncMock,
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
		loginMutateAsyncMock.mockReset();
		navigateMock.mockReset();
		authenticateMock.mockReset();
		vi.spyOn(window, "alert").mockImplementation(() => {});
	});

	afterEach(() => {
		window.alert.mockRestore();
	});

	it("navigates to the student dashboard on successful student login", async () => {
		loginMutateAsyncMock.mockResolvedValue({
			user: { role: "student" },
			token: "token-123",
		});

		const user = userEvent.setup();

		render(
			<AuthContext.Provider value={{ authenticate: authenticateMock }}>
				<MemoryRouter>
					<SignIn />
				</MemoryRouter>
			</AuthContext.Provider>,
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

		expect(loginMutateAsyncMock).toHaveBeenCalledWith({
			email: "pelumi@slu.edu",
			password: "secret123",
		});
		expect(authenticateMock).toHaveBeenCalledWith({
			role: "student",
			token: "token-123",
		});
		expect(navigateMock).toHaveBeenCalledWith("/student-dashboard");
	});

	it("does not navigate when login credentials are invalid", async () => {
		loginMutateAsyncMock.mockRejectedValue({
			response: {
				data: {
					message: "Invalid email or password.",
				},
			},
		});

		const user = userEvent.setup();

		render(
			<AuthContext.Provider value={{ authenticate: authenticateMock }}>
				<MemoryRouter>
					<SignIn />
				</MemoryRouter>
			</AuthContext.Provider>,
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

		await waitFor(() => {
			expect(loginMutateAsyncMock).toHaveBeenCalledWith({
				email: "wrong@slu.edu",
				password: "wrongpass",
			});
		});
		expect(authenticateMock).not.toHaveBeenCalled();
		expect(navigateMock).not.toHaveBeenCalled();
	});

	it("navigates to tutor dashboard when tutor logs in", async () => {
		loginMutateAsyncMock.mockResolvedValue({
			user: { role: "tutor" },
			token: "token-456",
		});

		const user = userEvent.setup();

		render(
			<AuthContext.Provider value={{ authenticate: authenticateMock }}>
				<MemoryRouter>
					<SignIn />
				</MemoryRouter>
			</AuthContext.Provider>,
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

		expect(authenticateMock).toHaveBeenCalledWith({
			role: "tutor",
			token: "token-456",
		});
		expect(navigateMock).toHaveBeenCalledWith("/tutor-dashboard");
	});
});
