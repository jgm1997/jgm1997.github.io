import { Injectable } from "@nestjs/common";

@Injectable()
export class WebhookService {
    processEvent(event: any) {
        const {type, record, old_record: oldRecord} = event;
        
        switch (type) {
            case 'INSERT':
                console.log('New task:', record);
                break;
            case 'UPDATE':
                console.log('Updated task:', record);
                break;
            case 'DELETE':
                console.log('Deleted task:', oldRecord);
                break;
            default:
                console.log('Unknown event type:', type);
        }
    }
}