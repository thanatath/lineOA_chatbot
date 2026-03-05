import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: string) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
      };

      send("connected", JSON.stringify({ version: store.getUpdateVersion() }));

      const removeClient = store.addSSEClient(send);

      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(keepAlive);
          removeClient();
        }
      }, 15000);

      const checkClosed = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(""));
        } catch {
          clearInterval(keepAlive);
          clearInterval(checkClosed);
          removeClient();
        }
      }, 5000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
