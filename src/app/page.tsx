import ChatbotOnboarding from "@/components/ChatbotOnboarding";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-950">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-8">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-zinc-800 bg-gradient-to-b from-zinc-900 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-zinc-900 lg:p-4 text-zinc-300">
          Welcome to&nbsp;
          <code className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Internship Copilot</code>
        </p>
      </div>
      
      <ChatbotOnboarding />
    </main>
  );
}
