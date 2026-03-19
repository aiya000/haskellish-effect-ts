import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../utils/create-rule.js";

type Options = [];
type MessageIds = "missingEffectReturn";

function hasEffectReturnType(
  returnType: TSESTree.TSTypeAnnotation | undefined
): boolean {
  if (!returnType) return false;

  const typeAnnotation = returnType.typeAnnotation;

  // Effect<...>
  if (
    typeAnnotation.type === "TSTypeReference" &&
    typeAnnotation.typeName.type === "Identifier" &&
    typeAnnotation.typeName.name === "Effect"
  ) {
    return true;
  }

  // Effect.Effect<...>
  if (
    typeAnnotation.type === "TSTypeReference" &&
    typeAnnotation.typeName.type === "TSQualifiedName" &&
    typeAnnotation.typeName.left.type === "Identifier" &&
    typeAnnotation.typeName.left.name === "Effect" &&
    typeAnnotation.typeName.right.name === "Effect"
  ) {
    return true;
  }

  return false;
}

export const effectBoundary = createRule<Options, MessageIds>({
  name: "effect-boundary",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Exported functions should have an Effect return type annotation",
    },
    messages: {
      missingEffectReturn:
        "Exported function \"{{name}}\" should have an explicit Effect return type annotation.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function checkFunction(
      node:
        | TSESTree.FunctionDeclaration
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionExpression,
      name: string
    ) {
      if (!hasEffectReturnType(node.returnType)) {
        context.report({
          node,
          messageId: "missingEffectReturn",
          data: { name },
        });
      }
    }

    return {
      "ExportNamedDeclaration > FunctionDeclaration"(
        node: TSESTree.FunctionDeclaration
      ) {
        if (node.id) {
          checkFunction(node, node.id.name);
        }
      },
      "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator"(
        node: TSESTree.VariableDeclarator
      ) {
        if (
          node.id.type === "Identifier" &&
          node.init &&
          (node.init.type === "ArrowFunctionExpression" ||
            node.init.type === "FunctionExpression")
        ) {
          checkFunction(node.init, node.id.name);
        }
      },
    };
  },
});
