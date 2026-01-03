import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../constants';
import { AppRoute } from '../types';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-background-dark min-h-[100dvh]">
      {/* Main Content Area */}
      <div className="flex flex-col flex-grow">
        {/* Hero Section */}
        <div className="w-full px-4 pt-4 pb-2">
          <div className="relative w-full aspect-[3/4] group flex items-center justify-center">
            <div
              className="absolute inset-0 bg-center bg-contain bg-no-repeat transition-transform duration-700 hover:scale-105"
              style={{ backgroundImage: `url("${IMAGES.welcomeHero}")` }}
            ></div>
            {/* Gradient Overlay */}
            {/* Gradient Overlay Removed */}
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center px-6 pt-6 text-center">
          <h1 className="text-[#111418] dark:text-white tracking-tight text-3xl font-extrabold leading-tight mb-3">
            Explore o Mundo <br /> sem Estresse
          </h1>
          <p className="text-[#637588] dark:text-[#93a5b8] text-base font-normal leading-relaxed max-w-xs mx-auto">
            Organize roteiros, controle gastos e guarde memórias incríveis em um só lugar.
          </p>

          {/* Feature Icons */}
          <div className="flex items-center justify-center gap-6 mt-6 opacity-80">
            <div className="flex flex-col items-center gap-1 text-[#111418] dark:text-white">
              <span className="material-symbols-outlined text-primary text-2xl">map</span>
              <span className="text-xs font-medium">Roteiros</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[#111418] dark:text-white">
              <span className="material-symbols-outlined text-primary text-2xl">payments</span>
              <span className="text-xs font-medium">Gastos</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[#111418] dark:text-white">
              <span className="material-symbols-outlined text-primary text-2xl">photo_library</span>
              <span className="text-xs font-medium">Memórias</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col w-full px-4 pt-6 pb-8 bg-white dark:bg-background-dark">
        {/* Indicators */}
        <div className="flex w-full flex-row items-center justify-center gap-2 mb-6">
          <div className="h-2 w-6 rounded-full bg-primary transition-all"></div>
          <div className="h-2 w-2 rounded-full bg-[#dbe0e6] dark:bg-[#3e4a56]"></div>
          <div className="h-2 w-2 rounded-full bg-[#dbe0e6] dark:bg-[#3e4a56]"></div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center w-full mb-4">
          <button
            onClick={() => navigate(AppRoute.LOGIN)}
            className="flex w-full max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-primary hover:bg-blue-600 active:bg-blue-700 transition-colors text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-blue-500/20"
          >
            <span className="truncate">Começar Agora</span>
            <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
          </button>
        </div>

        {/* Login Link */}
        {/* Login Link Removed as per request */}
        <div className="h-2"></div>
        <div className="h-2"></div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
