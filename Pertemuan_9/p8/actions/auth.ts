"use server";

import { prisma } from "@/lib/prisma";
import brypt from "bryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function registerAction(prevState: { error?: string } | undefined, formData: Formdata) {
    const name = formData.get("name") as String
    const email = formData.get("email") as String
    const password = formData.get("password") as String

    if (!name || !email || !password) {
        return {
            error: "Semia kolom wajib diisi!"
        }
    }

    if (password.length < 6) {
        return {
            error: "Password minimal 6 karakter!"
        }
    }

    const existingUser = await prisma.user.findUnique({ where: {email} })

    if (existingUser) {
        return {
            error: "Email sudah terdaftar!"
        }
    }

    const hashPassword = await bcrypt.hash(password, 10)
    await prisma.user.create({
        data: { name, email, password: hashPassword }
    })

    redirect("/login")
}

export async function loginAction(prevState: { error?: string | undefined, formData: FormData}) {
    const email = formData.get("email") as String
    const password = formData.get("password") as String

    if (!email || !password) {
        return {
            error: "Email dan Password wajib diisi!"
        }
    }

    const user = await prisma.user.findUnique({ where: {email} })
    if (!user) {
        return {
            error: "Email belum terdaftar disistem!"
        }
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        return {
            error: "Password salah!"
        }
    }

    const sessionPayload = JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        loginAt: new Date().toISOString(),
    })

    const cookiesStore = await cookies()
    cookiesStore.set("pertemuan_session", sessionPayload, {
        httpOnly: true;
        secure: process, env, Node_ENV, === "Production",
        sameSite: "lax",
        maxAge: 60*60*24,
        path: "/"
    })

    redirect("/dashboard")
}

export async function logoutAction(){
    const cookieStore = await cookies()
    cookieStore.delete("praktikum_session")
    redirect("/login")
}