/**
 * LifecycleTracker — 10-stage property lifecycle stepper
 * Horizontal on desktop, vertical on mobile.
 * Each stage is color-coded by actor type.
 */
import { Check, Lock } from 'lucide-react';
import { LIFECYCLE_STAGES } from '../data/mock';

const ACTOR_STYLES = {
  seller:  { dot: 'bg-blue-800 border-blue-800',    text: 'text-blue-800',    tag: 'actor-seller'  },
  officer: { dot: 'bg-amber-600 border-amber-600',  text: 'text-amber-700',   tag: 'actor-officer' },
  buyer:   { dot: 'bg-green-600 border-green-600',  text: 'text-green-700',   tag: 'actor-buyer'   },
  chain:   { dot: 'bg-gray-500 border-gray-500',    text: 'text-gray-600',    tag: 'actor-chain'   },
};

const ACTOR_LABELS = { seller: 'Seller', officer: 'Officer', buyer: 'Buyer', chain: 'Blockchain' };

export default function LifecycleTracker({ currentStage, compact = false }) {
  const currentIdx = LIFECYCLE_STAGES.findIndex(s => s.key === currentStage);

  return (
    <>
      {/* Desktop: horizontal stepper */}
      <div className={`hidden ${compact ? '' : 'md:block'}`}>
        <HorizontalTracker currentIdx={currentIdx} />
      </div>
      {/* Mobile / compact: vertical stepper */}
      <div className={compact ? 'block' : 'block md:hidden'}>
        <VerticalTracker currentIdx={currentIdx} />
      </div>
    </>
  );
}

function HorizontalTracker({ currentIdx }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-start min-w-max gap-0">
        {LIFECYCLE_STAGES.map((stage, idx) => {
          const done    = idx < currentIdx;
          const active  = idx === currentIdx;
          const pending = idx > currentIdx;
          const actor   = ACTOR_STYLES[stage.actor];

          return (
            <div key={stage.key} className="flex items-start">
              {/* Step bubble + label */}
              <div className="flex flex-col items-center w-28">
                <div className="relative flex items-center justify-center">
                  {done ? (
                    <div className={`h-8 w-8 rounded-full ${actor.dot} flex items-center justify-center shadow-sm`}>
                      <Check className="h-4 w-4 text-white" strokeWidth={2.5} />
                    </div>
                  ) : active ? (
                    <div className={`h-8 w-8 rounded-full ${actor.dot} flex items-center justify-center ring-4 ring-offset-2 ring-opacity-20 shadow-md`}
                         style={{ '--tw-ring-color': 'currentColor' }}>
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                      <Lock className="h-3 w-3 text-gray-300" />
                    </div>
                  )}
                  {/* Actor tag */}
                  {(done || active) && (
                    <span className={`absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold px-1.5 py-0.5 rounded ${actor.tag}`}>
                      {ACTOR_LABELS[stage.actor]}
                    </span>
                  )}
                </div>
                <p className={`mt-2 text-center text-[11px] leading-tight font-medium px-1 ${
                  done || active ? actor.text : 'text-gray-400'
                }`}>
                  {stage.label}
                </p>
              </div>

              {/* Connector line (not after last) */}
              {idx < LIFECYCLE_STAGES.length - 1 && (
                <div className={`mt-4 h-0.5 w-4 flex-shrink-0 rounded ${idx < currentIdx ? actor.dot.split(' ')[0] : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VerticalTracker({ currentIdx }) {
  return (
    <div className="space-y-0">
      {LIFECYCLE_STAGES.map((stage, idx) => {
        const done    = idx < currentIdx;
        const active  = idx === currentIdx;
        const actor   = ACTOR_STYLES[stage.actor];
        const isLast  = idx === LIFECYCLE_STAGES.length - 1;

        return (
          <div key={stage.key} className="flex gap-3">
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              {done ? (
                <div className={`h-7 w-7 rounded-full ${actor.dot} flex items-center justify-center shrink-0`}>
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </div>
              ) : active ? (
                <div className={`h-7 w-7 rounded-full ${actor.dot} flex items-center justify-center shrink-0 ring-4 ring-offset-2 ring-opacity-20`}>
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              ) : (
                <div className="h-7 w-7 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center shrink-0">
                  <Lock className="h-3 w-3 text-gray-300" />
                </div>
              )}
              {!isLast && <div className={`w-0.5 flex-1 min-h-4 ${idx < currentIdx ? 'bg-blue-800' : 'bg-gray-200'}`} />}
            </div>

            {/* Content */}
            <div className={`pb-5 ${isLast ? '' : ''}`}>
              <div className="flex items-center gap-2 mb-0.5">
                <p className={`text-sm font-semibold ${done || active ? actor.text : 'text-gray-400'}`}>
                  {stage.label}
                </p>
                {(done || active) && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${actor.tag}`}>
                    {ACTOR_LABELS[stage.actor]}
                  </span>
                )}
              </div>
              {(done || active) && (
                <p className="text-xs text-gray-500">{stage.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
