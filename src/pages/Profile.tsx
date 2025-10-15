import { useNavigate } from "react-router-dom";
import { useGetUser } from "@/hooks/useGetUser";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const Profile = () => {
	const navigate = useNavigate();
	const { data: user, isLoading, error } = useGetUser();

	const handleLogout = () => {
		navigate("/");
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map(n => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const getRoleBadgeColor = (role: string) => {
		switch (role) {
			case "admin":
				return "bg-slate-100 text-slate-800";
			case "user":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (isLoading) {
		return (
			<div className="p-6">
				<div className="flex items-center justify-center h-64">
					<p className="text-gray-500">Loading profile...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-6">
					<p className="text-red-800">Failed to load profile information.</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="p-6">
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
					<p className="text-yellow-800">No user data available.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-gray-900">Profile</h1>
				<Button
					onClick={handleLogout}
					variant="outline"
					className="text-slate-600 hover:text-slate-700 hover:bg-slate-50"
				>
					Logout (no really)
				</Button>
			</div>

			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				{/* Profile Header */}
				<div className="bg-slate-200 h-28"></div>

				<div className="px-6 pb-6">
					{/* Avatar and Basic Info */}
					<div className="flex items-start gap-6 -mt-10 mb-8">
						<Avatar className="h-32 w-32 border-4 border-white shadow-lg">
							<AvatarImage
								src={user.avatarUrl}
								alt={user.name}
							/>
							<AvatarFallback className="text-2xl font-semibold bg-gray-300 text-gray-700">{getInitials(user.name)}</AvatarFallback>
						</Avatar>

						<div className="mt-16">
							<h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
							<p className="text-gray-600">@{user.username}</p>
						</div>
					</div>

					{/* User Details */}
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="bg-gray-50 rounded-lg p-4">
								<label className="text-sm font-medium text-gray-500">Username</label>
								<p className="mt-1 text-gray-900">{user.username}</p>
							</div>

							<div className="bg-gray-50 rounded-lg p-4">
								<label className="text-sm font-medium text-gray-500">Role</label>
								<div className="mt-1">
									<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
										{user.role.charAt(0).toUpperCase() + user.role.slice(1)}
									</span>
								</div>
							</div>

							<div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
								<label className="text-sm font-medium text-gray-500">User ID</label>
								<p className="mt-1 text-gray-900 font-mono text-sm">{user.id}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
