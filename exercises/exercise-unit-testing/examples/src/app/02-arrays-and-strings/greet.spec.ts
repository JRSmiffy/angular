import { greet } from "./greet";

describe('greet', () => {
    it('should include the name in the message', () => {
        expect(greet('James')).toContain('James');
    })
})