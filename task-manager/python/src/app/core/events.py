from app.models.webhook import WebhookPayload

def handle_event(event: WebhookPayload):
    if event.type == "INSERT":
        print(f"New task: {event.record}")
    elif event.type == "UPDATE":
        print(f"Updated task: {event.record}")
    elif event.type == "DELETE":
        print(f"Deleted task: {event.old_record}")