import { NextResponse } from "next/server";
import { getUserById, updateUser } from "@/lib/db/users";
import type { UserRole } from "@/lib/ecommerce";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const role = body.role as UserRole | undefined;

    if (role && role !== "admin" && role !== "user") {
      return NextResponse.json({ error: "Invalid user role." }, { status: 400 });
    }

    if (role) {
      const actorId = String(body.actorId || "");
      const actor = actorId ? await getUserById(actorId) : null;

      if (!actor || actor.role !== "admin") {
        return NextResponse.json({ error: "Only admin users can change user roles." }, { status: 403 });
      }
    }

    const user = await updateUser(id, {
      name: body.name,
      phone: body.phone,
      address: body.address,
      city: body.city,
      role,
    });

    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update user.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
