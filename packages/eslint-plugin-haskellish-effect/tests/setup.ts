import { RuleTester } from "@typescript-eslint/rule-tester"
import { describe, it, afterAll } from "bun:test"

RuleTester.describe = describe
RuleTester.it = it
RuleTester.afterAll = afterAll
