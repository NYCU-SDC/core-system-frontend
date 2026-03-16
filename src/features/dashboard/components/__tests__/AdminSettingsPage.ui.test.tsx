import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ChangeEvent, KeyboardEvent, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPushToast } = vi.hoisted(() => ({
	mockPushToast: vi.fn()
}));

vi.mock("@/features/dashboard/hooks/useOrgSettings", () => ({
	useActiveOrgSlug: vi.fn(),
	useOrg: vi.fn(),
	useOrgMembers: vi.fn(),
	useUpdateOrg: vi.fn(),
	useAddOrgMember: vi.fn(),
	useRemoveOrgMember: vi.fn()
}));

vi.mock("@/layouts", () => ({
	AdminLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>
}));

vi.mock("@/seo/useSeo", () => ({ useSeo: () => null }));

vi.mock("@/shared/components", () => ({
	Button: ({ children, onClick, processing, disabled }: { children?: ReactNode; onClick?: () => void; processing?: boolean; disabled?: boolean }) => (
		<button onClick={onClick} disabled={!!processing || !!disabled}>
			{children}
		</button>
	),
	Dialog: ({ open, description, children, footer, onOpenChange }: { open?: boolean; description?: string; children?: ReactNode; footer?: ReactNode; onOpenChange?: (open: boolean) => void }) =>
		open ? (
			<div role="dialog">
				{description && <p>{description}</p>}
				{children}
				<div>{footer}</div>
				<button onClick={() => onOpenChange?.(false)}>__close__</button>
			</div>
		) : null,
	ErrorMessage: ({ message }: { message: string }) => <p role="alert">{message}</p>,
	Input: ({
		value,
		onChange,
		onKeyDown,
		placeholder,
		type,
		id
	}: {
		value?: string;
		onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
		onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
		placeholder?: string;
		type?: string;
		id?: string;
	}) => <input id={id} type={type} value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder} />,
	Label: ({ children, htmlFor, required }: { children?: ReactNode; htmlFor?: string; required?: boolean }) => (
		<label htmlFor={htmlFor}>
			{children}
			{required ? " *" : ""}
		</label>
	),
	LoadingSpinner: () => <div data-testid="loading-spinner" role="status" />,
	useToast: () => ({ pushToast: mockPushToast })
}));

import { useActiveOrgSlug, useAddOrgMember, useOrg, useOrgMembers, useRemoveOrgMember, useUpdateOrg } from "@/features/dashboard/hooks/useOrgSettings";
import { AdminSettingsPage } from "../AdminSettingsPage";

const mockUseActiveOrgSlug = vi.mocked(useActiveOrgSlug);
const mockUseOrg = vi.mocked(useOrg);
const mockUseOrgMembers = vi.mocked(useOrgMembers);
const mockUseUpdateOrg = vi.mocked(useUpdateOrg);
const mockUseAddOrgMember = vi.mocked(useAddOrgMember);
const mockUseRemoveOrgMember = vi.mocked(useRemoveOrgMember);

type RawMember = { id: string | null; name: string | null; emails: string[]; avatarUrl: string | null };

const makeMember = (overrides: Partial<RawMember> = {}): RawMember => ({
	id: "m1",
	name: "Alice",
	emails: ["alice@example.com"],
	avatarUrl: null,
	...overrides
});

const mockOrg = { name: "NYCU SDC", slug: "SDC", description: "", metadata: {} };

function setupDefaults() {
	mockUseActiveOrgSlug.mockReturnValue("SDC");
	mockUseOrg.mockReturnValue({ data: mockOrg, isLoading: false, isError: false, error: null } as unknown as ReturnType<typeof useOrg>);
	mockUseOrgMembers.mockReturnValue({ data: [], isLoading: false, isError: false, error: null } as unknown as ReturnType<typeof useOrgMembers>);
	mockUseUpdateOrg.mockReturnValue({ mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useUpdateOrg>);
	mockUseAddOrgMember.mockReturnValue({ mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useAddOrgMember>);
	mockUseRemoveOrgMember.mockReturnValue({ mutate: vi.fn(), isPending: false } as unknown as ReturnType<typeof useRemoveOrgMember>);
}

function getRemoveButtons() {
	return screen.getAllByRole("button").filter(btn => btn.textContent === "");
}

describe("AdminSettingsPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		setupDefaults();
	});

	it("org name input shows Loading… placeholder when org is loading", () => {
		mockUseOrg.mockReturnValue({ data: undefined, isLoading: true, isError: false, error: null } as unknown as ReturnType<typeof useOrg>);
		render(<AdminSettingsPage />);
		const orgInput = document.getElementById("orgName");
		expect(orgInput).toHaveAttribute("placeholder", "Loading…");
	});

	it("pushes error toast when org query fails", async () => {
		mockUseOrg.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			error: new Error("org fetch failed")
		} as unknown as ReturnType<typeof useOrg>);
		render(<AdminSettingsPage />);
		await waitFor(() => {
			expect(mockPushToast).toHaveBeenCalledWith(expect.objectContaining({ title: "無法載入組織資訊" }));
		});
	});

	it("pushes error toast when members query fails", async () => {
		mockUseOrgMembers.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			error: new Error("members fetch failed")
		} as unknown as ReturnType<typeof useOrgMembers>);
		render(<AdminSettingsPage />);
		await waitFor(() => {
			expect(mockPushToast).toHaveBeenCalledWith(expect.objectContaining({ title: "無法載入成員列表" }));
		});
	});

	it("org name input shows the org name from API", () => {
		render(<AdminSettingsPage />);
		expect(document.getElementById("orgName")).toHaveValue("NYCU SDC");
	});

	it("page title is 組織管理", () => {
		render(<AdminSettingsPage />);
		expect(screen.getByRole("heading", { name: "組織管理" })).toBeInTheDocument();
	});

	it("displays member name and email correctly", () => {
		mockUseOrgMembers.mockReturnValue({
			data: [makeMember({ id: "m1", name: "Alice", emails: ["alice@example.com"] })],
			isLoading: false,
			isError: false,
			error: null
		} as unknown as ReturnType<typeof useOrgMembers>);
		render(<AdminSettingsPage />);
		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.getByText("alice@example.com")).toBeInTheDocument();
	});

	it("renders all members when multiple exist", () => {
		mockUseOrgMembers.mockReturnValue({
			data: [
				makeMember({ id: "m1", name: "Alice", emails: ["alice@example.com"] }),
				makeMember({ id: "m2", name: "Bob", emails: ["bob@example.com"] }),
				makeMember({ id: "m3", name: "Carol", emails: ["carol@example.com"] })
			],
			isLoading: false,
			isError: false,
			error: null
		} as unknown as ReturnType<typeof useOrgMembers>);
		render(<AdminSettingsPage />);
		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.getByText("Bob")).toBeInTheDocument();
		expect(screen.getByText("Carol")).toBeInTheDocument();
	});

	it("member with null name is filtered out", () => {
		mockUseOrgMembers.mockReturnValue({
			data: [makeMember({ id: "m1", name: "Alice", emails: ["alice@example.com"] }), { id: "m2", name: null, emails: ["ghost@example.com"], avatarUrl: null }],
			isLoading: false,
			isError: false,
			error: null
		} as unknown as ReturnType<typeof useOrgMembers>);
		render(<AdminSettingsPage />);
		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.queryByText("ghost@example.com")).not.toBeInTheDocument();
	});

	it("member with null id is filtered out", () => {
		mockUseOrgMembers.mockReturnValue({
			data: [makeMember({ id: "m1", name: "Alice", emails: ["alice@example.com"] }), { id: null, name: "Ghost", emails: ["ghost@example.com"], avatarUrl: null }],
			isLoading: false,
			isError: false,
			error: null
		} as unknown as ReturnType<typeof useOrgMembers>);
		render(<AdminSettingsPage />);
		expect(screen.queryByText("Ghost")).not.toBeInTheDocument();
	});

	it("confirm-kick dialog is not in DOM on initial render", () => {
		render(<AdminSettingsPage />);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("clicking the remove button opens the confirmation dialog", async () => {
		mockUseOrgMembers.mockReturnValue({
			data: [makeMember({ id: "m1", name: "Alice", emails: ["alice@example.com"] })],
			isLoading: false,
			isError: false,
			error: null
		} as unknown as ReturnType<typeof useOrgMembers>);
		render(<AdminSettingsPage />);
		const [removeBtn] = getRemoveButtons();
		await userEvent.click(removeBtn);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("confirmation dialog shows the target member's name", async () => {
		mockUseOrgMembers.mockReturnValue({
			data: [makeMember({ id: "m1", name: "Alice", emails: ["alice@example.com"] })],
			isLoading: false,
			isError: false,
			error: null
		} as unknown as ReturnType<typeof useOrgMembers>);
		render(<AdminSettingsPage />);
		await userEvent.click(getRemoveButtons()[0]);
		expect(screen.getByRole("dialog")).toHaveTextContent("Alice");
	});

	it("clicking 取消 inside dialog closes it", async () => {
		mockUseOrgMembers.mockReturnValue({
			data: [makeMember({ id: "m1", name: "Alice", emails: ["alice@example.com"] })],
			isLoading: false,
			isError: false,
			error: null
		} as unknown as ReturnType<typeof useOrgMembers>);
		render(<AdminSettingsPage />);
		await userEvent.click(getRemoveButtons()[0]);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "取消" }));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("email input is initially empty", () => {
		render(<AdminSettingsPage />);
		const emailInput = screen.getByPlaceholderText("member@example.com") as HTMLInputElement;
		expect(emailInput.value).toBe("");
	});

	describe("save org name interaction", () => {
		it("calls updateOrgMutation.mutate when Enter is pressed in the org name input", async () => {
			const mockMutate = vi.fn();
			mockUseUpdateOrg.mockReturnValue({ mutate: mockMutate, isPending: false } as unknown as ReturnType<typeof useUpdateOrg>);
			render(<AdminSettingsPage />);
			const orgInput = document.getElementById("orgName")!;
			orgInput.focus();
			await userEvent.keyboard("{Enter}");
			expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({ name: "NYCU SDC", slug: "SDC" }), expect.any(Object));
		});

		it("shows success toast when org name is saved", async () => {
			let capturedOnSuccess: () => void;
			const mockMutate = vi.fn((_, { onSuccess }) => {
				capturedOnSuccess = onSuccess;
			});
			mockUseUpdateOrg.mockReturnValue({ mutate: mockMutate, isPending: false } as unknown as ReturnType<typeof useUpdateOrg>);
			render(<AdminSettingsPage />);
			document.getElementById("orgName")!.focus();
			await userEvent.keyboard("{Enter}");
			capturedOnSuccess!();
			expect(mockPushToast).toHaveBeenCalledWith(expect.objectContaining({ title: "編輯成功", variant: "success" }));
		});

		it("shows error toast when org name save fails", async () => {
			let capturedOnError: (e: Error) => void;
			const mockMutate = vi.fn((_, { onError }) => {
				capturedOnError = onError;
			});
			mockUseUpdateOrg.mockReturnValue({ mutate: mockMutate, isPending: false } as unknown as ReturnType<typeof useUpdateOrg>);
			render(<AdminSettingsPage />);
			document.getElementById("orgName")!.focus();
			await userEvent.keyboard("{Enter}");
			capturedOnError!(new Error("save failed"));
			expect(mockPushToast).toHaveBeenCalledWith(expect.objectContaining({ title: "儲存失敗", variant: "error" }));
		});
	});

	describe("add member interaction", () => {
		it("calls addMemberMutation.mutate with trimmed email when 新增成員 is clicked", async () => {
			const mockMutate = vi.fn();
			mockUseAddOrgMember.mockReturnValue({ mutate: mockMutate, isPending: false } as unknown as ReturnType<typeof useAddOrgMember>);
			render(<AdminSettingsPage />);
			await userEvent.type(screen.getByPlaceholderText("member@example.com"), "new@example.com");
			await userEvent.click(screen.getByRole("button", { name: "新增成員" }));
			expect(mockMutate).toHaveBeenCalledWith({ email: "new@example.com" }, expect.any(Object));
		});

		it("does not call addMemberMutation when email is empty", async () => {
			const mockMutate = vi.fn();
			mockUseAddOrgMember.mockReturnValue({ mutate: mockMutate, isPending: false } as unknown as ReturnType<typeof useAddOrgMember>);
			render(<AdminSettingsPage />);
			await userEvent.click(screen.getByRole("button", { name: "新增成員" }));
			expect(mockMutate).not.toHaveBeenCalled();
		});

		it("clears the email input and shows success toast on successful add", async () => {
			let capturedOnSuccess: () => void;
			const mockMutate = vi.fn((_, { onSuccess }) => {
				capturedOnSuccess = onSuccess;
			});
			mockUseAddOrgMember.mockReturnValue({ mutate: mockMutate, isPending: false } as unknown as ReturnType<typeof useAddOrgMember>);
			render(<AdminSettingsPage />);
			const emailInput = screen.getByPlaceholderText("member@example.com") as HTMLInputElement;
			await userEvent.type(emailInput, "new@example.com");
			await userEvent.click(screen.getByRole("button", { name: "新增成員" }));
			act(() => {
				capturedOnSuccess!();
			});
			await waitFor(() => expect(emailInput.value).toBe(""));
			expect(mockPushToast).toHaveBeenCalledWith(expect.objectContaining({ title: "邀請成功", variant: "success" }));
		});

		it("shows error toast when adding member fails", async () => {
			let capturedOnError: (e: Error) => void;
			const mockMutate = vi.fn((_, { onError }) => {
				capturedOnError = onError;
			});
			mockUseAddOrgMember.mockReturnValue({ mutate: mockMutate, isPending: false } as unknown as ReturnType<typeof useAddOrgMember>);
			render(<AdminSettingsPage />);
			await userEvent.type(screen.getByPlaceholderText("member@example.com"), "bad@example.com");
			await userEvent.click(screen.getByRole("button", { name: "新增成員" }));
			capturedOnError!(new Error("Email 已存在"));
			expect(mockPushToast).toHaveBeenCalledWith(expect.objectContaining({ title: "邀請失敗", variant: "error" }));
		});
	});

	describe("remove member interaction", () => {
		const threeMemberSetup = () => {
			mockUseOrgMembers.mockReturnValue({
				data: [
					makeMember({ id: "m1", name: "Alice", emails: ["alice@example.com"] }),
					makeMember({ id: "m2", name: "Bob", emails: ["bob@example.com"] }),
					makeMember({ id: "m3", name: "Carol", emails: ["carol@example.com"] })
				],
				isLoading: false,
				isError: false,
				error: null
			} as unknown as ReturnType<typeof useOrgMembers>);
		};

		it("calls removeMemberMutation.mutate with member id when 確認移除 is clicked", async () => {
			const mockMutate = vi.fn();
			mockUseRemoveOrgMember.mockReturnValue({ mutate: mockMutate, isPending: false } as unknown as ReturnType<typeof useRemoveOrgMember>);
			threeMemberSetup();
			render(<AdminSettingsPage />);
			await userEvent.click(getRemoveButtons()[0]);
			await userEvent.click(screen.getByRole("button", { name: "確認移除" }));
			expect(mockMutate).toHaveBeenCalledWith("m1", expect.any(Object));
		});

		it("closes dialog and shows success toast after successful removal", async () => {
			let capturedOnSuccess: () => void;
			const mockMutate = vi.fn((_, { onSuccess }) => {
				capturedOnSuccess = onSuccess;
			});
			mockUseRemoveOrgMember.mockReturnValue({ mutate: mockMutate, isPending: false } as unknown as ReturnType<typeof useRemoveOrgMember>);
			threeMemberSetup();
			render(<AdminSettingsPage />);
			await userEvent.click(getRemoveButtons()[0]);
			await userEvent.click(screen.getByRole("button", { name: "確認移除" }));
			act(() => {
				capturedOnSuccess!();
			});
			expect(mockPushToast).toHaveBeenCalledWith(expect.objectContaining({ title: "已移除成員", variant: "success" }));
			await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
		});

		it("shows error toast when removal fails, dialog stays open", async () => {
			let capturedOnError: (e: Error) => void;
			const mockMutate = vi.fn((_, { onError }) => {
				capturedOnError = onError;
			});
			mockUseRemoveOrgMember.mockReturnValue({ mutate: mockMutate, isPending: false } as unknown as ReturnType<typeof useRemoveOrgMember>);
			threeMemberSetup();
			render(<AdminSettingsPage />);
			await userEvent.click(getRemoveButtons()[0]);
			await userEvent.click(screen.getByRole("button", { name: "確認移除" }));
			capturedOnError!(new Error("server error"));
			expect(mockPushToast).toHaveBeenCalledWith(expect.objectContaining({ title: "移除失敗", variant: "error" }));
		});
	});
});
