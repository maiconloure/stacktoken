import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';
import { Address, ContractFunction, Query, U64Value, AddressValue } from '@multiversx/sdk-core';
import { useGetAccountInfo, useGetIsLoggedIn } from "@multiversx/sdk-dapp/hooks"
import { sendTransactions } from "@multiversx/sdk-dapp/services"

export interface QuestionData {
  questionId: string;
  creator: string;
  title: string;
  description: string;
  deadline: number;
  lockedAmount: number;
  createdAt: number;
  status: QuestionStatus;
  approvedAnswerId: boolean;
}

type QuestionStatus = 'Created' | 'Answered' | 'AnswerApproved' | 'Expired';

export interface AnswerData {
  answerId: string;
  questionId: string;
  creator: string;
  title: string;
  description: string;
  createdAt: number;
  votes: number;
  approved: boolean;
}

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || 
  'erd1qqqqqqqqqqqqqpgqehrq4xr838lrlv0h4ht20fnl9ywsw3v7sjus85qv7x';

const NETWORK_API = process.env.REACT_APP_NETWORK_API || 
  'https://devnet-api.multiversx.com';

export class ContractService {
  private networkProvider: ProxyNetworkProvider;
  private contractAddress: Address;

  constructor() {
    this.networkProvider = new ProxyNetworkProvider(NETWORK_API);
    this.contractAddress = new Address(CONTRACT_ADDRESS);
  }

  async postQuestion(title: string, description: string, deadline: number, reward: number) {

  }

  async getQuestionDetails(questionId: string) {}

  async getAnswersForQuestion(questionId: string) {}

  async submitAnswer() {}

  async approveAnswer(questionId: string, answerId: string) {}

  async getAllOpenQuestions() {}

  async getQuestionsByStatus(status: QuestionStatus) {}

  async getExpiredQuestions() {}

}