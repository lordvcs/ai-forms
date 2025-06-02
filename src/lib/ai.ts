import {
	AutomaticSpeechRecognitionPipeline,
	pipeline,
	QuestionAnsweringPipeline
} from '@huggingface/transformers';

class AI {
	static cache = {};
	static pipelinePromises: Promise<[QuestionAnsweringPipeline, AutomaticSpeechRecognitionPipeline]>;
	static async loadPipelines() {
		const pipelinePromises = Promise.all([
			// pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad', {
			pipeline('question-answering', 'tomasmcm/nlpconnect-deberta-v3-xsmall-squad2-onnx', {
				cache_dir: './cache/qa',
				progress_callback: (progress) => {
					if (progress.status == 'done') {
						console.log('QA Progress:', progress);
					}
				}
			}),
			pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
				cache_dir: './cache/asr'
			})
		]);

		AI.pipelinePromises = pipelinePromises;
		return pipelinePromises;
	}
	static async getAnswerer() {
		const [answerer] = await AI.pipelinePromises;
		return answerer;
	}
	static async getTranscriber() {
		const [_, transcriber] = await AI.pipelinePromises;
		return transcriber;
	}
}

export default AI;
