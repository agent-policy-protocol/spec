import { NextRequest, NextResponse } from "next/server";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { readFileSync } from "fs";
import { join } from "path";

let cachedSchema: object | null = null;

function getSchema(): object {
  if (cachedSchema) return cachedSchema;
  const schemaPath = join(
    process.cwd(),
    "public",
    "schema",
    "v1",
    "agent-policy.schema.json",
  );
  cachedSchema = JSON.parse(readFileSync(schemaPath, "utf-8"));
  return cachedSchema!;
}

export async function POST(request: NextRequest) {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    const body = await request.json();

    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);

    const schema = getSchema();
    const validate = ajv.compile(schema);
    const valid = validate(body);

    if (valid) {
      return NextResponse.json({ valid: true }, { headers });
    }

    const errors = (validate.errors || []).map((err) => ({
      path: err.instancePath || "/",
      message: err.message || "Unknown validation error",
      keyword: err.keyword,
      params: err.params,
    }));

    return NextResponse.json({ valid: false, errors }, { headers });
  } catch {
    return NextResponse.json(
      {
        valid: false,
        errors: [
          {
            path: "/",
            message: "Invalid JSON input",
          },
        ],
      },
      { status: 400, headers },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
