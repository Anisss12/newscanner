import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const filePath = path.join(process.cwd(), "data.json");

const loadData = () => {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    return fileContent ? JSON.parse(fileContent) : [];
  }
  return [];
};

const saveData = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

export async function POST(req) {
  const existingData = loadData();
  const newData = await req.json();
  existingData.push(newData);
  saveData(existingData);

  return NextResponse.json(
    { message: "Data saved successfully", data: newData },
    { status: 200 }
  );
}

export async function GET() {
  const data = loadData();
  return NextResponse.json(data, { status: 200 });
}

export async function PUT(req) {
  const existingData = loadData();
  const updatedData = await req.json();
  const index = existingData.findIndex((item) => item.id === updatedData.id);

  if (index !== -1) {
    existingData[index] = updatedData;
    saveData(existingData);
    return NextResponse.json(
      { message: "Data updated successfully", data: updatedData },
      { status: 200 }
    );
  } else {
    return NextResponse.json({ message: "Data not found" }, { status: 404 });
  }
}



export async function DELETE(req) {
  try {
    console.log("DELETE request received");

    // Load existing data
    const existingData = loadData();
    console.log("Existing data loaded:", existingData);

    // Parse the request body
    const { ids } = await req.json();
    console.log("Received IDs to delete:", ids);

    // Validate the request body
    if (!ids || !Array.isArray(ids)) {
      console.error("Invalid request: 'ids' must be an array");
      return NextResponse.json(
        { message: "Invalid request: 'ids' must be an array" },
        { status: 400 }
      );
    }

    // Filter out the items to delete
    const deletedData = existingData.filter((item) => ids.includes(item.id));
    console.log("Items to delete:", deletedData);

    if (deletedData.length > 0) {
      // Save the remaining data
      const updatedData = existingData.filter((item) => !ids.includes(item.id));
      saveData(updatedData);
      console.log("Data saved successfully");

      return NextResponse.json(
        { message: "Data deleted successfully", data: deletedData },
        { status: 200 }
      );
    } else {
      console.error("No matching data found");
      return NextResponse.json(
        { message: "No matching data found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
