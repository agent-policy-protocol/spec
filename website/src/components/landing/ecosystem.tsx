import { EcosystemDiagram } from "@/components/landing/ecosystem-diagram";

export function EcosystemPosition() {
  const protocols = [
    {
      name: "WebMCP",
      author: "Google/Microsoft",
      purpose: "Browser-native tool contracts",
      gap: "No consent management",
    },
    {
      name: "MCP",
      author: "Anthropic",
      purpose: "Server-side tool/data integration",
      gap: "No website-level policies",
    },
    {
      name: "A2A",
      author: "Google",
      purpose: "Agent-to-agent communication",
      gap: "No resource owner authorization",
    },
    {
      name: "AP2",
      author: "Community",
      purpose: "Agent payment flows",
      gap: "No access control before payment",
    },
    {
      name: "APAAI",
      author: "Community",
      purpose: "Post-hoc action auditing",
      gap: "Reactive, not preventive",
    },
    {
      name: "UCP",
      author: "Community",
      purpose: "Universal commerce",
      gap: "No access control",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
            The Missing Layer in the Agentic Stack
          </h2>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
            APoP fills the authorization gap that no other protocol addresses.
          </p>
        </div>

        {/* Interactive Diagram */}
        <EcosystemDiagram />

        {/* Detail Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-white">
                  Protocol
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-white">
                  Purpose
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-white">
                  Gap APoP Fills
                </th>
              </tr>
            </thead>
            <tbody>
              {protocols.map((protocol) => (
                <tr
                  key={protocol.name}
                  className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {protocol.name}
                      </span>
                      <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                        {protocol.author}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-neutral-600 dark:text-neutral-300">
                    {protocol.purpose}
                  </td>
                  <td className="py-3 px-4 text-sm text-amber-600 dark:text-amber-400 font-medium">
                    {protocol.gap}
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-50 dark:bg-blue-950/50">
                <td className="py-3 px-4">
                  <span className="font-bold text-blue-700 dark:text-blue-400">
                    APoP
                  </span>
                  <span className="block text-xs text-blue-600 dark:text-blue-300">
                    Superdom AI
                  </span>
                </td>
                <td className="py-3 px-4 text-sm font-medium text-blue-700 dark:text-blue-300">
                  Authorization & consent layer
                </td>
                <td className="py-3 px-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ Fills all gaps above
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
