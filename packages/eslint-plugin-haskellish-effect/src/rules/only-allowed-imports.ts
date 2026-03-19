import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils/create-rule.js";
import { isAllowedImportSource } from "../utils/allowed-sources.js";

type Options = [{ allowedPackages?: string[] }];
type MessageIds = "disallowedImport";

export const onlyAllowedImports = createRule<Options, MessageIds>({
  name: "only-allowed-imports",
  meta: {
    type: "problem",
    docs: {
      description:
        "Restrict imports to haskellish-effect, relative paths, and explicitly allowed packages",
    },
    messages: {
      disallowedImport:
        'Import from "{{source}}" is not allowed. Use haskellish-effect or add it to allowedPackages.',
    },
    schema: [
      {
        type: "object",
        properties: {
          allowedPackages: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context) {
    const [options] = context.options;
    const allowedPackages = options?.allowedPackages ?? [];

    function checkSource(source: string, node: TSESTree.Node) {
      if (!isAllowedImportSource(source, allowedPackages)) {
        context.report({
          node,
          messageId: "disallowedImport",
          data: { source },
        });
      }
    }

    return {
      ImportDeclaration(node) {
        checkSource(node.source.value, node);
      },
      ImportExpression(node) {
        if (node.source.type === "Literal" && typeof node.source.value === "string") {
          checkSource(node.source.value, node);
        }
      },
      ExportNamedDeclaration(node) {
        if (node.source) {
          checkSource(node.source.value, node);
        }
      },
      ExportAllDeclaration(node) {
        checkSource(node.source.value, node);
      },
    };
  },
});
