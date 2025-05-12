import { SupabaseClient } from '@supabase/supabase-js';

// Define types for messages and builds
interface Message {
  id: number;
  created_at: string;
  session_id: number;
  role: string;
  content: string;
}

interface BuildData {
  name: string;
  description?: string;
  parts: { [key: string]: string };
  total_price?: number;
  created_at?: string;
}

interface Build {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  total_price: number | null;
  session_id: number | null;
  build_data: BuildData;
}

// Function to extract build data from messages
async function extractBuildData(messages: Message[]): Promise<BuildData[]> {
  const buildRegex = /```build\s*([\s\S]*?)```/g;
  const buildDatas: BuildData[] = [];

  let match;
  while ((match = buildRegex.exec(messages.map(m => m.content).join('\n'))) !== null) {
    try {
      const buildJson = match[1].trim();
      const buildData = JSON.parse(buildJson) as BuildData;
      buildDatas.push(buildData);
    } catch (error) {
      console.error("Failed to parse build data:", error);
    }
  }

  return buildDatas;
}

// Function to save build data to Supabase
async function saveBuildData(supabase: SupabaseClient, buildData: BuildData, sessionId: number): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('builds')
      .insert([
        {
          name: buildData.name,
          description: buildData.description || '',
          total_price: buildData.total_price || 0,
          session_id: sessionId,
          build_data: buildData,
        },
      ]);

    if (error) {
      console.error("Failed to save build data:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error saving build data:", error);
    return null;
  }
}

// Function to generate builds from messages
export async function generateBuildsFromMessages() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key not provided");
    return;
  }

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch all messages
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });

  if (messagesError) {
    console.error("Failed to fetch messages:", messagesError);
    return;
  }

  // Group messages by session_id
  const groupedMessages: { [sessionId: number]: Message[] } = messages.reduce((acc: { [sessionId: number]: Message[] }, message: Message) => {
    if (!acc[message.session_id]) {
      acc[message.session_id] = [];
    }
    acc[message.session_id].push(message);
    return acc;
  }, {});

  // Iterate through each session and extract build data
  for (const sessionId in groupedMessages) {
    if (groupedMessages.hasOwnProperty(sessionId)) {
      const messages = groupedMessages[sessionId];
      const buildDatas = await extractBuildData(messages);

      // Save each build data to Supabase
      for (const buildData of buildDatas) {
        await saveBuildData(supabase, buildData, parseInt(sessionId));
      }
    }
  }

  console.log("Build generation completed.");
}

// Function to sanitize string to be FS and OS safe
function sanitizeString(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, '_');
}

// Function to convert build data to a string format
function convertBuildDataToString(buildData: BuildData): string {
  let buildString = `Build Name: ${buildData.name}\n`;
  if (buildData.description) {
    buildString += `Description: ${buildData.description}\n`;
  }
  buildString += "Parts:\n";
  for (const key in buildData.parts) {
    if (buildData.parts.hasOwnProperty(key)) {
      buildString += `  ${key}: ${buildData.parts[key]}\n`;
    }
  }
  if (buildData.total_price) {
    buildString += `Total Price: ${buildData.total_price}\n`;
  }
  return buildString;
}

type JsonValue = 
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];
