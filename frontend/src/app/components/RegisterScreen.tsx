import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppStore } from "../store";
import { ArrowLeft, MessageCircle } from "lucide-react";

export function RegisterScreen() {
  const navigate = useNavigate();
  const register = useAppStore((s) => s.register);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chats", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError("请填写所有字段");
      return;
    }

    setSubmitting(true);
    setError("");
    const result = await register(username, email, password);
    setSubmitting(false);

    if (result.success) {
      navigate("/chats", { replace: true });
      return;
    }

    setError(result.error || "注册失败，请稍后再试");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center h-12 px-4 border-b border-[#E5E5E5]">
        <button onClick={() => navigate(-1)} className="p-1 text-[#111]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="flex-1 text-center text-[17px] text-[#111] pr-7">注册</span>
      </div>

      <div className="flex flex-col px-8 pt-8">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#07C160] flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <input
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-[#111] placeholder-[#999] outline-none focus:border-[#07C160]"
          />
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-[#111] placeholder-[#999] outline-none focus:border-[#07C160]"
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-[#111] placeholder-[#999] outline-none focus:border-[#07C160]"
          />

          {error && <p className="text-[13px] text-[#ee0a24]">{error}</p>}

          <button
            onClick={handleRegister}
            disabled={submitting}
            className="w-full h-12 rounded-lg bg-[#07C160] text-white hover:bg-[#06ae56] active:bg-[#059e4e] transition-colors disabled:opacity-60"
          >
            {submitting ? "注册中..." : "注册"}
          </button>
        </div>

        <p className="text-center text-[12px] text-[#bbb] mt-8">POST /auth/register</p>
      </div>
    </div>
  );
}
