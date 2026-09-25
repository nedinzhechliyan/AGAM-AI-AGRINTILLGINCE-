import { useState } from 'react';
import {
  Layers,
  MapPin,
  Droplets,
  CloudRain,
  Sprout,
  History,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Database,
  Code,
  Copy,
  Check,
  ShieldCheck,
  Share2,
  Cpu,
  ArrowRight,
  Server
} from 'lucide-react';
import { STATE_AGRI_DATA, StateAgriculturalSchema, DistrictSchema } from '../data/schemaData';
import { evaluateIrrigationRisk, RULE_TEST_CASES } from '../rules/advisoryEngine';

export function DataArchitectureTab() {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'state-TamilNadu': true,
    'state-Karnataka': true,
    'district-Chengalpattu': true,
    'district-Thanjavur': true,
    'district-Mandya': true,
    'district-Dharwad': true,
  });

  const [activeViewMode, setActiveViewMode] = useState<'tree' | 'cards'>('cards');
  const [copiedState, setCopiedState] = useState<string | null>(null);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    STATE_AGRI_DATA.forEach((s) => {
      allExpanded[`state-${s.state}`] = true;
      s.districts.forEach((d) => {
        allExpanded[`district-${d.name}`] = true;
      });
    });
    setExpandedNodes(allExpanded);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  const handleCopy = (stateObj: StateAgriculturalSchema) => {
    const jsonOutput = {
      state: stateObj.state,
      districts: stateObj.districts.map((d) => ({
        name: d.name,
        soilMoisture: d.soilMoisture,
        rainForecast: d.rainForecast,
        crop: d.crop,
        advisoryHistory: d.advisoryHistory,
      })),
    };
    navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2));
    setCopiedState(stateObj.state);
    setTimeout(() => setCopiedState(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Caption Callout */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wider text-emerald-800 uppercase flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-700" />
              Unified Agricultural Telemetry Schema
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
              Cross-State Agronomic Data Architecture
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Visualized schema hierarchy representing interoperable field parameters across Indian states.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-stone-100 p-1 rounded-lg border border-stone-200 flex items-center text-xs font-medium">
              <button
                onClick={() => setActiveViewMode('cards')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeViewMode === 'cards'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Card Schema View
              </button>
              <button
                onClick={() => setActiveViewMode('tree')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeViewMode === 'tree'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Tree Node View
              </button>
            </div>
          </div>
        </div>

        {/* Highlighted Prompt Caption */}
        <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-700 text-white shrink-0 mt-0.5 shadow-2xs">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
              National Interoperability Guarantee
            </span>
            <p className="text-sm font-medium text-emerald-900 mt-0.5 leading-relaxed">
              "This shared schema allows any Indian state to plug in their agricultural data using the same structure — enabling cross-state data cooperation."
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-emerald-800">
              <span className="inline-flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                State-Agnostic
              </span>
              <span className="inline-flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Horizontally Scalable
              </span>
              <span className="inline-flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ICAR & AgStack Compliant
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side State Schema Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {STATE_AGRI_DATA.map((stateData) => {
          const isTN = stateData.state === 'TamilNadu';
          const accentColor = isTN ? 'emerald' : 'sky';

          return (
            <div
              key={stateData.state}
              className="bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col overflow-hidden"
            >
              {/* State Header Node */}
              <div
                className={`p-4 border-b ${
                  isTN
                    ? 'bg-emerald-900 text-white border-emerald-950'
                    : 'bg-stone-900 text-white border-stone-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-9 h-9 rounded-lg font-black text-sm flex items-center justify-center shadow-xs ${
                        isTN
                          ? 'bg-emerald-800 text-emerald-200 ring-1 ring-emerald-500/50'
                          : 'bg-sky-900 text-sky-200 ring-1 ring-sky-500/50'
                      }`}
                    >
                      {stateData.stateCode}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold tracking-tight">
                          {stateData.state}
                        </h2>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            isTN
                              ? 'bg-emerald-800 text-emerald-200'
                              : 'bg-stone-800 text-stone-200'
                          }`}
                        >
                          Node: state
                        </span>
                      </div>
                      <p className="text-xs text-stone-300">
                        {stateData.region} · Capital: {stateData.capital}
                      </p>
                    </div>
                  </div>

                  {/* Schema Action: Copy Payload */}
                  <button
                    onClick={() => handleCopy(stateData)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="Copy schema JSON"
                  >
                    {copiedState === stateData.state ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-300" />
                        <span className="text-stone-200">Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Schema Metadata Pill Row */}
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-stone-300">
                  <span className="font-mono text-[11px]">
                    schema: StateAgriculturalRecord
                  </span>
                  <span>{stateData.districts.length} Integrated Districts</span>
                </div>
              </div>

              {/* District Collection Body (Readable Card View or Tree View) */}
              <div className="p-5 flex-1 space-y-4 bg-stone-50/50">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-stone-500" />
                    districts: Array&lt;DistrictSchema&gt;
                  </span>
                  <span className="font-mono text-[11px] text-stone-400">
                    [2 items]
                  </span>
                </div>

                {activeViewMode === 'cards' ? (
                  /* Formatted Card View */
                  <div className="space-y-4">
                    {stateData.districts.map((district, dIdx) => {
                      const computed = evaluateIrrigationRisk(
                        district.soilMoisture,
                        district.rainForecast
                      );

                      return (
                        <div
                          key={district.name}
                          className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs hover:border-stone-300 transition-colors"
                        >
                          {/* District Title & Crop */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-700">
                                #{dIdx + 1}
                              </div>
                              <div>
                                <span className="text-[10px] font-mono text-stone-400 block uppercase">
                                  district.name
                                </span>
                                <h3 className="text-base font-bold text-stone-900">
                                  {district.name}
                                </h3>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] font-mono text-stone-400 block uppercase">
                                district.crop
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mt-0.5">
                                <Sprout className="w-3 h-3 text-emerald-600" />
                                {district.crop}
                              </span>
                            </div>
                          </div>

                          {/* Telemetry Metric Cards */}
                          <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                            {/* soilMoisture */}
                            <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200/80">
                              <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                                <span className="flex items-center gap-1 text-stone-700 font-sans font-medium">
                                  <Droplets className="w-3 h-3 text-sky-600" />
                                  soilMoisture
                                </span>
                                <span>number</span>
                              </div>
                              <div className="mt-1 flex items-baseline gap-1">
                                <span className="text-xl font-bold font-mono text-stone-900">
                                  {district.soilMoisture}
                                </span>
                                <span className="text-xs text-stone-500 font-semibold">%</span>
                              </div>
                              <div className="mt-1.5 w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    district.soilMoisture < 30
                                      ? 'bg-rose-500'
                                      : district.soilMoisture <= 50
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${district.soilMoisture}%` }}
                                />
                              </div>
                            </div>

                            {/* rainForecast */}
                            <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200/80">
                              <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                                <span className="flex items-center gap-1 text-stone-700 font-sans font-medium">
                                  <CloudRain className="w-3 h-3 text-blue-600" />
                                  rainForecast
                                </span>
                                <span>number</span>
                              </div>
                              <div className="mt-1 flex items-baseline gap-1">
                                <span className="text-xl font-bold font-mono text-stone-900">
                                  {district.rainForecast}
                                </span>
                                <span className="text-xs text-stone-500 font-semibold">mm</span>
                              </div>
                              <div className="mt-1.5 w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500"
                                  style={{
                                    width: `${Math.min(100, (district.rainForecast / 25) * 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Advisory Rule Engine Output for this schema node */}
                          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                            <span className="text-stone-500 flex items-center gap-1 text-[11px]">
                              <span>Computed Risk:</span>
                              <strong
                                className={`uppercase font-bold ${
                                  computed.riskLevel === 'high'
                                    ? 'text-rose-600'
                                    : computed.riskLevel === 'medium'
                                    ? 'text-amber-600'
                                    : 'text-emerald-600'
                                }`}
                              >
                                {computed.riskLevel}
                              </strong>
                            </span>

                            <span className="text-[11px] font-medium text-stone-600">
                              Irrigation:{' '}
                              <strong className={computed.irrigationNeeded ? 'text-rose-600' : 'text-emerald-600'}>
                                {computed.irrigationNeeded ? 'YES' : 'NO'}
                              </strong>
                            </span>
                          </div>

                          {/* advisoryHistory Array View */}
                          <div className="mt-2.5 pt-2.5 border-t border-dashed border-stone-200">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-mono text-stone-500 flex items-center gap-1">
                                <History className="w-3 h-3 text-stone-400" />
                                advisoryHistory
                              </span>
                              <span className="text-stone-400 font-mono">
                                [{district.advisoryHistory.length} logs]
                              </span>
                            </div>

                            {district.advisoryHistory.length > 0 ? (
                              <div className="mt-1.5 space-y-1">
                                {district.advisoryHistory.map((item, hIdx) => (
                                  <div
                                    key={hIdx}
                                    className="bg-stone-50 p-1.5 rounded text-[11px] font-mono flex items-center justify-between text-stone-700 border border-stone-200/60"
                                  >
                                    <span>{item.timestamp}</span>
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                                        item.riskLevel === 'high'
                                          ? 'bg-rose-100 text-rose-800'
                                          : item.riskLevel === 'medium'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-emerald-100 text-emerald-800'
                                      }`}
                                    >
                                      {item.riskLevel}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-1 text-[11px] text-stone-400 italic bg-stone-50 p-1.5 rounded text-center">
                                [] (Empty history array, ready for telemetry writes)
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Formatted Hierarchical Tree View */
                  <div className="bg-white rounded-xl border border-stone-200 p-4 font-mono text-xs space-y-2.5">
                    {/* State Root Node */}
                    <div className="flex items-center gap-1.5 text-stone-900 font-bold">
                      <span className="text-emerald-700">●</span>
                      <span>state:</span>
                      <span className="text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        "{stateData.state}"
                      </span>
                    </div>

                    {/* Districts Array Node */}
                    <div className="ml-4 pl-3 border-l-2 border-stone-200 space-y-3">
                      <div className="text-stone-500 font-semibold flex items-center gap-1">
                        <span>▼</span>
                        <span>districts: [</span>
                      </div>

                      {stateData.districts.map((district, dIdx) => (
                        <div key={district.name} className="ml-4 pl-3 border-l-2 border-stone-200 space-y-1">
                          <div className="text-stone-700 font-bold">
                            &#123; <span className="text-stone-400">// Index {dIdx}</span>
                          </div>

                          <div className="ml-4 space-y-1 text-stone-700">
                            <div>
                              <span className="text-stone-400">name:</span>{' '}
                              <strong className="text-stone-900">"{district.name}"</strong>
                            </div>
                            <div>
                              <span className="text-stone-400">soilMoisture:</span>{' '}
                              <span className="text-blue-700 font-bold">{district.soilMoisture}</span>
                              <span className="text-stone-400"> // %</span>
                            </div>
                            <div>
                              <span className="text-stone-400">rainForecast:</span>{' '}
                              <span className="text-blue-700 font-bold">{district.rainForecast}</span>
                              <span className="text-stone-400"> // mm</span>
                            </div>
                            <div>
                              <span className="text-stone-400">crop:</span>{' '}
                              <strong className="text-emerald-800">"{district.crop}"</strong>
                            </div>
                            <div>
                              <span className="text-stone-400">advisoryHistory:</span>{' '}
                              <span className="text-stone-500">[{district.advisoryHistory.length} items]</span>
                            </div>
                          </div>

                          <div className="text-stone-700 font-bold">&#125;,</div>
                        </div>
                      ))}

                      <div className="text-stone-500 font-semibold">]</div>
                    </div>
                  </div>
                )}
              </div>

              {/* State Footer Badge */}
              <div className="p-3.5 bg-stone-100/70 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Schema validated: strict TypeScript interface</span>
                </span>
                <span className="font-mono text-stone-400 text-[11px]">
                  State #{stateData.stateCode}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schema Structural Specification Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              Interface Specification (TypeScript Contract)
            </span>
          </div>
          <span className="text-xs font-mono text-stone-400">
            src/data/schemaData.ts
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
            <span className="font-bold text-stone-800 block mb-1">
              Field: <code className="text-emerald-800">state: string</code>
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              Top-level geographic partition key (e.g. "TamilNadu", "Karnataka", "AndhraPradesh", "Punjab").
            </p>
          </div>

          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
            <span className="font-bold text-stone-800 block mb-1">
              Field: <code className="text-emerald-800">districts: DistrictSchema[]</code>
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              Sub-state agrarian administrative blocks providing telemetry readings for soil moisture, precipitation, and active crop.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
            <span className="font-bold text-stone-800 block mb-1">
              Field: <code className="text-emerald-800">advisoryHistory: Array</code>
            </span>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              Auditable timestamped event log of rule engine trigger history and irrigation advisories delivered to farmers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
