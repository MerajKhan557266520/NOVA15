
import React, { useEffect, useState } from 'react';
import { MarketData } from '../types';

interface DataWidgetsProps {
    show: boolean;
}

const DataWidgets: React.FC<DataWidgetsProps> = ({ show }) => {
    const [markets, setMarkets] = useState<MarketData[]>([
        { symbol: 'BTC', price: '98,240', change: '+5.4%', trend: 'up' },
        { symbol: 'ETH', price: '5,420', change: '+2.1%', trend: 'up' },
        { symbol: 'SOL', price: '340', change: '+8.5%', trend: 'up' },
        { symbol: 'NVDA', price: '1,140', change: '+1.1%', trend: 'up' },
    ]);

    // Live update simulation
    useEffect(() => {
        if (!show) return; // Save resources if hidden
        const interval = setInterval(() => {
            setMarkets(prev => prev.map(m => {
                const change = (Math.random() - 0.4).toFixed(2);
                return { 
                    ...m, 
                    price: (parseInt(m.price.replace(',','')) + Math.floor(Math.random() * 50 - 20)).toLocaleString(),
                    trend: Number(change) > 0 ? 'up' : 'down',
                    change: (Number(change) > 0 ? '+' : '') + change + '%'
                };
            }));
        }, 800);
        return () => clearInterval(interval);
    }, [show]);

    return (
        <div 
            className={`
                absolute right-0 top-20 bottom-20 w-80 
                bg-black/90 backdrop-blur-xl border-l border-cyan-500/30 
                shadow-[-10px_0_30px_rgba(6,182,212,0.1)]
                z-50 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
                ${show ? 'translate-x-0' : 'translate-x-full'}
            `}
        >
            {/* High Tech Header */}
            <div className="h-10 bg-cyan-950/30 border-b border-cyan-500/30 flex items-center justify-between px-4">
                <span className="text-cyan-400 font-orbitron text-xs tracking-widest">NOVA INTELLIGENCE</span>
                <div className="flex gap-1">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-cyan-400 rounded-full opacity-50"></div>
                </div>
            </div>

            <div className="p-6 space-y-4">
                <div className="text-[10px] text-gray-500 font-mono mb-2">LIVE MARKET FEED</div>
                
                {markets.map((m) => (
                    <div key={m.symbol} className="flex justify-between items-center border-b border-white/5 pb-2">
                        <div>
                            <div className="text-white font-bold font-orbitron">{m.symbol}</div>
                        </div>
                        <div className="text-right">
                             <div className="font-mono text-cyan-200 text-sm">${m.price}</div>
                             <div className={`text-[10px] ${m.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                 {m.change}
                             </div>
                        </div>
                    </div>
                ))}

                {/* Simulated Analysis Chart */}
                <div className="mt-8">
                     <div className="text-[10px] text-gray-500 font-mono mb-2">TREND ANALYSIS</div>
                     <div className="h-24 flex items-end justify-between gap-1 border-b border-l border-cyan-500/20 p-1">
                        {[...Array(15)].map((_,i) => (
                            <div 
                                key={i} 
                                className="w-full bg-cyan-500/40 hover:bg-cyan-400 transition-all duration-300" 
                                style={{ height: `${30 + Math.random() * 60}%` }}
                            ></div>
                        ))}
                     </div>
                </div>
            </div>
            
            {/* Decoration */}
            <div className="absolute bottom-4 left-4 text-[9px] text-cyan-800 font-mono">
                SECURE STREAM :: ACTIVE
            </div>
        </div>
    );
};

export default DataWidgets;
