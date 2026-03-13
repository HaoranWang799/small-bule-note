import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppStore } from "../store";
import { MessageCircle } from "lucide-react";

export function LoginScreen() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chats", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError("请输入用户名或邮箱和密码");
      return;
    }
    setSubmitting(true);
    setError("");
    const result = await login(identifier, password);
    setSubmitting(false);
    if (result.success) {
      navigate("/chats", { replace: true });
    } else {
      setError(result.error || "登录失败，请检查账号和密码");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white px-8 pt-20">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-[#07C160] flex items-center justify-center mb-3">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-[22px] text-[#111]">IM Messenger</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <input
            placeholder="用户名或邮箱"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-[#111] placeholder-[#999] outline-none focus:border-[#07C160]"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-[#111] placeholder-[#999] outline-none focus:border-[#07C160]"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        {error && <p className="text-[13px] text-[#ee0a24]">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={submitting}
          className="w-full h-12 rounded-lg bg-[#07C160] text-white hover:bg-[#06ae56] active:bg-[#059e4e] transition-colors disabled:opacity-60"
        >
          {submitting ? "登录中..." : "登录"}
        </button>

        <button
          onClick={() => navigate("/register")}
          disabled={submitting}
          className="w-full h-12 rounded-lg border border-[#07C160] text-[#07C160] bg-transparent hover:bg-[#f0faf4] transition-colors"
        >
          注册新账号
        </button>
      </div>

      <p className="text-center text-[12px] text-[#bbb] mt-auto mb-8">
        POST /auth/login
      </p>
    </div>
  );
}
