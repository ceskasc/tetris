"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";

type FormState = {
  hata: string;
  mesaj: string;
  yukleniyor: boolean;
};

function useFormState() {
  return useState<FormState>({
    hata: "",
    mesaj: "",
    yukleniyor: false,
  });
}

function AuthPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Panel strong className="mx-auto w-full max-w-xl p-8 md:p-10">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-soft">Lunara Hesabı</p>
        <h1 className="font-display text-5xl">{title}</h1>
        <p className="text-sm leading-7 text-muted">{description}</p>
      </div>
      <div className="mt-8">{children}</div>
    </Panel>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [state, setState] = useFormState();

  async function onSubmit(formData: FormData) {
    setState({ hata: "", mesaj: "", yukleniyor: true });
    const payload = {
      emailOrUsername: String(formData.get("emailOrUsername") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    const response = await fetch("/api/auth/giris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setState({
        hata: data.hata ?? "Giriş yapılamadı.",
        mesaj: "",
        yukleniyor: false,
      });
      return;
    }

    setState({ hata: "", mesaj: data.mesaj, yukleniyor: false });
    router.push("/ana-menu");
    router.refresh();
  }

  return (
    <AuthPanel
      title="Yeniden hoş geldin"
      description="Profilin, ilerlemen, turnuvaların ve koleksiyon vitrinlerin seni bekliyor."
    >
      <form action={onSubmit} className="space-y-4">
        <Input name="emailOrUsername" placeholder="E-posta veya kullanıcı adı" />
        <Input type="password" name="password" placeholder="Parola" />
        {state.hata ? <p className="text-sm text-[var(--danger)]">{state.hata}</p> : null}
        {state.mesaj ? <p className="text-sm text-[var(--success)]">{state.mesaj}</p> : null}
        <Button className="w-full" disabled={state.yukleniyor}>
          {state.yukleniyor ? "Giriş yapılıyor..." : "Giriş yap"}
        </Button>
      </form>
    </AuthPanel>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [state, setState] = useFormState();

  async function onSubmit(formData: FormData) {
    setState({ hata: "", mesaj: "", yukleniyor: true });

    const payload = {
      email: String(formData.get("email") ?? ""),
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
      displayName: String(formData.get("displayName") ?? ""),
    };

    const response = await fetch("/api/auth/kayit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setState({
        hata: data.hata ?? "Kayıt tamamlanamadı.",
        mesaj: "",
        yukleniyor: false,
      });
      return;
    }

    setState({ hata: "", mesaj: data.mesaj, yukleniyor: false });
    router.push("/hos-geldin");
    router.refresh();
  }

  return (
    <AuthPanel
      title="Yeni bir ritim başlat"
      description="Hesabını oluştur, ilerlemeni güvenle sakla ve online sahneye kendi kimliğinle çık."
    >
      <form action={onSubmit} className="grid gap-4">
        <Input name="displayName" placeholder="Görünen ad" />
        <Input name="username" placeholder="Kullanıcı adı" />
        <Input type="email" name="email" placeholder="E-posta" />
        <Input type="password" name="password" placeholder="Güçlü parola" />
        {state.hata ? <p className="text-sm text-[var(--danger)]">{state.hata}</p> : null}
        {state.mesaj ? <p className="text-sm text-[var(--success)]">{state.mesaj}</p> : null}
        <Button className="w-full" disabled={state.yukleniyor}>
          {state.yukleniyor ? "Hesap hazırlanıyor..." : "Hesabı oluştur"}
        </Button>
      </form>
    </AuthPanel>
  );
}

export function ForgotPasswordForm() {
  const [state, setState] = useFormState();

  async function onSubmit(formData: FormData) {
    setState({ hata: "", mesaj: "", yukleniyor: true });
    const response = await fetch("/api/auth/sifre-sifirlama-talebi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setState({
        hata: data.hata ?? "İstek gönderilemedi.",
        mesaj: "",
        yukleniyor: false,
      });
      return;
    }

    setState({ hata: "", mesaj: data.mesaj, yukleniyor: false });
  }

  return (
    <AuthPanel
      title="Parolanı yenile"
      description="Güvenli sıfırlama bağlantısını e-posta adresine gönderelim."
    >
      <form action={onSubmit} className="space-y-4">
        <Input type="email" name="email" placeholder="E-posta adresin" />
        {state.hata ? <p className="text-sm text-[var(--danger)]">{state.hata}</p> : null}
        {state.mesaj ? <p className="text-sm text-[var(--success)]">{state.mesaj}</p> : null}
        <Button className="w-full" disabled={state.yukleniyor}>
          {state.yukleniyor ? "Gönderiliyor..." : "Sıfırlama bağlantısı gönder"}
        </Button>
      </form>
    </AuthPanel>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useFormState();

  async function onSubmit(formData: FormData) {
    setState({ hata: "", mesaj: "", yukleniyor: true });
    const response = await fetch("/api/auth/sifre-sifirla", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        password: String(formData.get("password") ?? ""),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setState({
        hata: data.hata ?? "Parola güncellenemedi.",
        mesaj: "",
        yukleniyor: false,
      });
      return;
    }

    setState({ hata: "", mesaj: data.mesaj, yukleniyor: false });
    setTimeout(() => {
      router.push("/giris-yap");
    }, 1200);
  }

  return (
    <AuthPanel
      title="Yeni parola belirle"
      description="Bu bağlantı sadece kısa bir süre boyunca geçerli kalır."
    >
      <form action={onSubmit} className="space-y-4">
        <Input type="password" name="password" placeholder="Yeni parola" />
        {state.hata ? <p className="text-sm text-[var(--danger)]">{state.hata}</p> : null}
        {state.mesaj ? <p className="text-sm text-[var(--success)]">{state.mesaj}</p> : null}
        <Button className="w-full" disabled={state.yukleniyor}>
          {state.yukleniyor ? "Güncelleniyor..." : "Parolayı güncelle"}
        </Button>
      </form>
    </AuthPanel>
  );
}

export function ProfileIntroCard() {
  return (
    <Panel className="mx-auto mt-6 max-w-xl p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-soft">İnce Ayar</p>
      <h2 className="mt-3 font-display text-3xl">İlk izlenim, ilk ritim kadar önemlidir.</h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        Kullanıcı kartın, unvanın ve kısa biyografin platformun her yerinde zarif bir kimlik izine dönüşür.
      </p>
      <Textarea className="mt-4" defaultValue="Nazik ama kararlı bir seans arıyorum." />
    </Panel>
  );
}
