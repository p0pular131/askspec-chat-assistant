
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/ui/use-toast';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast({
          title: "로그인 성공",
          description: "환영합니다!",
        });
      } else {
        await signUp(email, password);
        toast({
          title: "회원가입 성공",
          description: "이메일을 확인해주세요.",
        });
      }
      navigate('/');
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "오류",
        description: isLogin ? "로그인에 실패했습니다." : "회원가입에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">AskSpec</h1>
          <p className="text-gray-500">{isLogin ? '로그인' : '회원가입'}</p>
        </div>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-askspec-purple"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-askspec-purple"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 text-white bg-askspec-purple rounded-md hover:bg-askspec-purple-dark focus:outline-none focus:ring-2 focus:ring-askspec-purple focus:ring-offset-2 transition-colors"
          >
            {isLoading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-askspec-purple hover:underline"
          >
            {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
