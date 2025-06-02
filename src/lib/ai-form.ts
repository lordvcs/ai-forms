import type { QuestionAnsweringOutput } from '@huggingface/transformers';
import AI from './ai';

class AiForm {
	static getAiNames() {
		const inputElements = Array.from(document.querySelectorAll('[data-ai-name]'));
		const aiNames = Array.from(inputElements).map((el) => el.getAttribute('data-ai-name'));
		return aiNames;
	}

	static async fillFormFromText(text: string) {
		const inputElements = Array.from(document.querySelectorAll('[data-ai-name]'));
		// const aiNames = AiForm.getAiNames();
		const questionsWithEls = inputElements.map((el) => {
			const aiName = el.getAttribute('data-ai-name');
			return { question: `What is ${aiName}`, el: el };
		});
		const answerer = await AI.getAnswerer();
		for (const qWithEl of questionsWithEls) {
			const answer = (await answerer?.(qWithEl.question, text)) as QuestionAnsweringOutput;
			console.log(`question: ${qWithEl.question}, answer: ${JSON.stringify(answer)}`);
			(qWithEl.el as HTMLInputElement).value = answer.answer;
		}
		// const answerPromises = questionsWithEls.map(async (qWithEl) => {
		// 	const answer = await answerer?.(qWithEl.question, text);
		// 	return { answer, el: qWithEl.el };
		// });
		// const answers = await Promise.all(answerPromises);
		// for (const answer of answers) {
		// 	console.log('output: ', answer.answer);
		// }
	}
}

export default AiForm;
