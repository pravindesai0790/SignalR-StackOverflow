<template>
  <article class="container" v-if="question">
    <header class="row align-items-center">
      <question-score :question="question" class="col-1" />
      <h3 class="col-11">{{ question.title }}</h3>
    </header>
    <p class="row">
      <vue-markdown class="offset-1 col-11">{{ question.body }}</vue-markdown>
    </p>
    <ul class="list-unstyled row" v-if="hasAnswers">
      <li v-for="answer in question.answers" :key="answer.id" class="offset-1 col-11 border-top py-2">
        <vue-markdown>{{ answer.body }}</vue-markdown>
      </li>
    </ul>
    <footer>
      <button class="btn btn-primary float-right" v-b-modal.addAnswerModal><i class="fas fa-edit"/> Post your Answer</button>
      <button class="btn btn-link float-right" @click="onReturnHome">Back to list</button>
    </footer>
    <add-answer-modal :question-id="this.questionId" @answer-added="onAnswerAdded"/>
  </article>
</template>

<script>
import VueMarkdown from 'vue-markdown'
import QuestionScore from '@/components/question-score'
import AddAnswerModal from '@/components/add-answer-modal'

export default {
  components: {
    VueMarkdown,
    QuestionScore,
    AddAnswerModal
  },
  data () {
    return {
      question: null,
      answers: [],
      questionId: this.$route.params.id
    }
  },
  computed: {
    hasAnswers () {
      return this.question.answers.length > 0
    }
  },
  created () {
    // Load the question and notify the server we are watching the question
    this.$http.get(`/api/question/${this.questionId}`).then(res => {
      this.question = res.data
      return this.$questionHub.questionOpened(this.questionId)
    })

    this.$questionHub.$on('answer-added', this.onAnswerAdded)
  },
  beforeDestroy () {
    // Notify the server we stopped watching the question
    this.$questionHub.questionClosed(this.questionId)
    this.$questionHub.$off('answer-added', this.onAnswerAdded)
  },
  methods: {
    onReturnHome () {
      this.$router.push({ name: 'Home' })
    },
    // This method can be called directly from the modal or after receiving an event through signalR
    onAnswerAdded (answer) {
      if (this.question.id !== answer.questionId) return
      if (!this.question.answers.find(a => a.id === answer.id)) {
        this.question.answers.push(answer)
      }
    }
  }
}
</script>
