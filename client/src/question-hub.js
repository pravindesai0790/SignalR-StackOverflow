import { HubConnectionBuilder, LogLevel } from '@aspnet/signalr'

export default {
    install (Vue) {
        const connection = new HubConnectionBuilder()
            .withUrl(`${Vue.prototype.$http.defaults.baseURL}/question-hub`)
            .configureLogging(LogLevel.Information)
            .build()

        // use new Vue instance as an event bus
        const questionHub = new Vue()

        // Forward serve side SignalR events through $questionHub, where components will listen to
        connection.on('QuestionScoreChange', (questionId, score) => {
            questionHub.$emit('score-changed', { questionId, score})
        })

        questionHub.questionOpened = (questionId) => {
            return startedPromise
                .then(() => connection.invoke('JoinQuestionGroup', questionId))
                .catch(console.error)
        }

        questionHub.questionClosed = (questionId) => {
            return startedPromise
                .then(() => connection.invoke('LeaveQuestionGroup', questionId))
                .catch(console.error)
        }

        connection.on('AnswerAdded', answer => {
            questionHub.$emit('answer-added', answer)
        })

        // every component will use this.$questionHub to access the event bus 
        Vue.prototype.$questionHub = questionHub
        
        
        let startedPromise = null
        function start() {
            startedPromise = connection.start()
                .catch(err => {
                    console.error('Faild to connect with hub', err)
                    return new Promise((resolve, reject) => 
                        setTimeout(() => start().then(resolve).catch(reject), 5000))
                })
            return startedPromise
        }
        connection.onclose(() => start())
        start()
    }
}
