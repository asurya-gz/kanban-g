"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Cookies from "js-cookie";

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      // Remove all cookies
      Cookies.remove("token");
      Cookies.remove("user");

      // Wait for animation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Redirect to login page
      router.push("/");
    };

    logout();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="text-center relative">
        {/* Pulsing background circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-100/50 rounded-full animate-ping-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-200/50 rounded-full animate-ping-slow delay-75" />

        {/* Main icon container */}
        <div className="relative">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg relative z-10">
            <div className="animate-bounce-gentle">
              <LogOut className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {/* Rotating rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-dashed animate-spin-slow" />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-dashed animate-reverse-spin" />
          </div>
        </div>

        <h1 className="mt-8 text-2xl font-semibold text-gray-900 animate-fade-in">
          Logging Out...
        </h1>
        <p className="mt-2 text-gray-600 animate-fade-in-delay">
          Please wait while we safely log you out
        </p>

        {/* Progress bar */}
        <div className="mt-8 w-64 h-2 bg-gray-100 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-progress shadow-sm" />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          10% {
            width: 10%;
          }
          90% {
            width: 90%;
          }
          100% {
            width: 100%;
          }
        }
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes reverse-spin {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        @keyframes bounce-gentle {
          0%,
          100% {
            transform: translateY(-5%);
          }
          50% {
            transform: translateY(5%);
          }
        }
        @keyframes ping-slow {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-progress {
          animation: progress 3s ease-in-out forwards;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-reverse-spin {
          animation: reverse-spin 12s linear infinite;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-fade-in-delay {
          opacity: 0;
          animation: fade-in 0.6s ease-out 0.2s forwards;
        }
        .delay-75 {
          animation-delay: 0.75s;
        }
      `}</style>
    </div>
  );
};

export default LogoutPage;
