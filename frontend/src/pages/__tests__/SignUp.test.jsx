import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "../../context";
import SignUp from "../SignUp";

const signupMutateAsyncMock = vi.fn();
const authenticateMock = vi.fn();
const navigateMock = vi.fn();

vi.mock("../../components/Navbar", () => ({
	default: () => <div>Navbar</div>,
}));

vi.mock("../../hooks/auth", () => ({
	useSignup: () => ({
		mutateAsync: signupMutateAsyncMock,
	}),
}));

vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

describe("SignUp page", () => {
	beforeEach(() => {
		signupMutateAsyncMock.mockReset();
		authenticateMock.mockReset();
		navigateMock.mockReset();
		vi.spyOn(window, "alert").mockImplementation(() => {});
	});

	afterEach(() => {
		window.alert.mockRestore();
	});

	it("blocks submission when passwords do not match", async () => {
		const user = userEvent.setup();

		render(
			<AuthContext.Provider value={{ authenticate: authenticateMock }}>
				<MemoryRouter>
					<SignUp />
				</MemoryRouter>
			</AuthContext.Provider>,
		);

		await user.type(screen.getByPlaceholderText("Enter your name"), "Pelumi");
		await user.type(
			screen.getByPlaceholderText("Enter your email"),
			"pelumi@slu.edu",
		);
		await user.type(
			screen.getByPlaceholderText("Create password"),
			"secret123",
		);
		await user.type(
			screen.getByPlaceholderText("Confirm password"),
			"different123",
		);

		await user.click(screen.getByRole("button", { name: /create account/i }));

		expect(window.alert).toHaveBeenCalledWith("Passwords do not match.");
		expect(signupMutateAsyncMock).not.toHaveBeenCalled();
	});

	it("calls registerUser when inputs are valid", async () => {
		signupMutateAsyncMock.mockResolvedValue({
			user: {
				name: "Pelumi",
				email: "pelumi@slu.edu",
				role: "student",
			},
			token: "signup-token",
		});

		const user = userEvent.setup();

		render(
			<AuthContext.Provider value={{ authenticate: authenticateMock }}>
				<MemoryRouter>
					<SignUp />
				</MemoryRouter>
			</AuthContext.Provider>,
		);

		await user.type(screen.getByPlaceholderText("Enter your name"), "Pelumi");
		await user.type(
			screen.getByPlaceholderText("Enter your email"),
			"pelumi@slu.edu",
		);
		await user.type(
			screen.getByPlaceholderText("Create password"),
			"secret123",
		);
		await user.type(
			screen.getByPlaceholderText("Confirm password"),
			"secret123",
		);

		await user.click(screen.getByRole("button", { name: /create account/i }));

		expect(signupMutateAsyncMock).toHaveBeenCalledWith({
			name: "Pelumi",
			email: "pelumi@slu.edu",
			password: "secret123",
			role: "student",
		});
		expect(authenticateMock).toHaveBeenCalledWith({
			name: "Pelumi",
			email: "pelumi@slu.edu",
			role: "student",
			token: "signup-token",
		});
		expect(navigateMock).toHaveBeenCalledWith("/signin");
	});
});
