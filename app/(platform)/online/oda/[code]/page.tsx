import { requireSessionUser } from "@/auth/session";
import { signSocketToken } from "@/multiplayer/token";
import { RoomClient } from "@/features/online/room-client";

export default async function OnlineRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const user = await requireSessionUser();
  const token = signSocketToken(user.id, user.username);

  return <RoomClient token={token} roomCode={code.toUpperCase()} userId={user.id} />;
}
