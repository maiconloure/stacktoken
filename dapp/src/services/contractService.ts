import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers';
import { 
  Address, 
  ContractFunction, 
  Query, 
  U64Value,
  BinaryCodec,
  AddressValue,
  BytesValue,
  BigUIntValue,
  OptionValue,
  U64Value as U64ValueType
} from '@multiversx/sdk-core';
import { sendTransactions } from "@multiversx/sdk-dapp/services"

export interface QuestionData {
  questionId: string;
  creator: string;
  title: string;
  description: string;
  deadline: number; // Unix timestamp in milliseconds
  lockedAmount: number;
  createdAt: number; // Unix timestamp in milliseconds
  status: QuestionStatus;
  approvedAnswerId: boolean | number;
}

type QuestionStatus = 'Created' | 'Answered' | 'AnswerApproved' | 'Expired';

// Binary decoder utility for MultiversX structs
class MultiversXDecoder {
  private buffer: Buffer;
  private offset: number;

  constructor(data: string | Buffer) {
    this.buffer = typeof data === 'string' ? Buffer.from(data, 'base64') : data;
    this.offset = 0;
  }

  // Read a u64 (8 bytes, big-endian)
  readU64(): number {
    const value = this.buffer.readBigUInt64BE(this.offset);
    this.offset += 8;
    return Number(value);
  }

  // Read an Address (32 bytes)
  readAddress(): string {
    const addressBytes = this.buffer.subarray(this.offset, this.offset + 32);
    this.offset += 32;
    return new Address(addressBytes).toBech32();
  }

  // Read bytes with length prefix (4 bytes length + data)
  readBytes(): string {
    const length = this.buffer.readUInt32BE(this.offset);
    this.offset += 4;
    const bytes = this.buffer.subarray(this.offset, this.offset + length);
    this.offset += length;
    return bytes.toString('utf8');
  }

  // Read BigUint with length prefix (4 bytes length + data)
  readBigUint(): number {
    const length = this.buffer.readUInt32BE(this.offset);
    this.offset += 4;
    if (length === 0) {
      return 0;
    }
    const bytes = this.buffer.subarray(this.offset, this.offset + length);
    this.offset += length;
    // Convert big-endian bytes to number
    let value = 0;
    for (let i = 0; i < bytes.length; i++) {
      value = value * 256 + bytes[i];
    }
    return value;
  }

  // Read QuestionStatus enum (1 byte)
  readQuestionStatus(): QuestionStatus {
    const discriminant = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    switch (discriminant) {
      case 0: return 'Created';
      case 1: return 'Answered';
      case 2: return 'AnswerApproved';
      case 3: return 'Expired';
      default: return 'Created';
    }
  }

  // Read Option<u64> (1 byte discriminant + optional 8 bytes)
  readOptionU64(): boolean | number {
    const hasValue = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    if (hasValue === 0) {
      return false; // None
    } else {
      return this.readU64(); // Some(value)
    }
  }

  // Decode a complete Question struct
  decodeQuestion(): QuestionData {
    const questionId = this.readU64().toString();
    const creator = this.readAddress();
    const title = this.readBytes();
    const description = this.readBytes();
    const deadline = this.readU64();
    const lockedAmount = this.readBigUint();
    const createdAtSeconds = this.readU64();
    const status = this.readQuestionStatus();
    const approvedAnswerId = this.readOptionU64();

    return {
      questionId,
      creator,
      title,
      description,
      deadline: deadline * 1000, // Convert seconds to milliseconds
      lockedAmount,
      createdAt: createdAtSeconds * 1000, // Convert seconds to milliseconds
      status,
      approvedAnswerId
    };
  }

  // Decode a complete Answer struct
  decodeAnswer(): AnswerData {
    const answerId = this.readU64().toString();
    const questionId = this.readU64().toString();
    const creator = this.readAddress();
    const title = this.readBytes();
    const description = this.readBytes();
    const createdAtSeconds = this.readU64();
    const votes = this.readU32();
    const approvedByCreator = this.readBool();

    return {
      answerId,
      questionId,
      creator,
      title,
      description,
      createdAt: createdAtSeconds * 1000, // Convert seconds to milliseconds
      votes,
      approved: approvedByCreator
    };
  }

  // Read a u32 (4 bytes, big-endian)
  readU32(): number {
    const value = this.buffer.readUInt32BE(this.offset);
    this.offset += 4;
    return value;
  }

  // Read a boolean (1 byte)
  readBool(): boolean {
    const value = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    return value === 1;
  }
}

export interface AnswerData {
  answerId: string;
  questionId: string;
  creator: string;
  title: string;
  description: string;
  createdAt: number; // Unix timestamp in milliseconds
  votes: number;
  approved: boolean;
}

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || 
  'erd1qqqqqqqqqqqqqpgqdgh2z6j2hvr2kmnxz7vl2zxpur3f7luxd8ss95vuaz';

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
    try {
      // Create the transaction data
      const data = `postQuestion@${Buffer.from(title).toString('hex')}@${Buffer.from(description).toString('hex')}@${deadline.toString(16).padStart(16, '0')}`;
      
      // Convert reward from EGLD to wei (18 decimals)
      console.log('Posting question with reward:', reward);
      const rewardInWei = BigInt(Math.floor(reward * Math.pow(10, 18)));
      console.log('Reward in wei:', rewardInWei.toString());
      
      // Send the transaction using the dApp SDK
      const sessionId = await sendTransactions({
        transactions: [{
          receiver: this.contractAddress.bech32(),
          value: rewardInWei.toString(),
          data: data,
          gasLimit: 10000000, // 10M gas limit
        }],
        transactionsDisplayInfo: {
          processingMessage: 'Posting question to blockchain...',
          errorMessage: 'An error has occurred during posting',
          successMessage: 'Question posted successfully!'
        },
        redirectAfterSign: false,
      });

      return sessionId;
    } catch (error) {
      console.error('Error posting question:', error);
      throw error;
    }
  }

  async getQuestionDetails(questionId: string): Promise<QuestionData | null> {
    try {
      const query = new Query({
        address: this.contractAddress,
        func: new ContractFunction('getQuestionDetails'),
        args: [new U64Value(parseInt(questionId))]
      });

      const response = await this.networkProvider.queryContract(query);
      
      if (response.returnData && response.returnData.length > 0) {
        // Parse the response data according to the contract's return format
        // This is a simplified version - you may need to adjust based on actual contract response
        const data = response.returnData[0];
        // Parse the encoded data into QuestionData format
        // Implementation depends on the exact encoding format from the contract
        return {
          questionId,
          creator: '', // Parse from data
          title: '', // Parse from data
          description: '', // Parse from data
          deadline: 0, // Parse from data
          lockedAmount: 0, // Parse from data
          createdAt: 0, // Parse from data
          status: 'Created', // Parse from data
          approvedAnswerId: false // Parse from data
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting question details:', error);
      return null;
    }
  }

  async getAnswersForQuestion(questionId: string): Promise<AnswerData[]> {
    try {
      const query = new Query({
        address: this.contractAddress,
        func: new ContractFunction('getAnswersForQuestion'),
        args: [new U64Value(parseInt(questionId))]
      });

      const response = await this.networkProvider.queryContract(query);
      
      if (response.returnData && response.returnData.length > 0) {
        console.log('Raw answers response:', response);
        
        const answers: AnswerData[] = [];

        // Each item in returnData represents an Answer struct encoded in binary
        for (let i = 0; i < response.returnData.length; i++) {
          try {
            console.log(`Decoding answer ${i} from base64:`, response.returnData[i]);
            
            const decoder = new MultiversXDecoder(response.returnData[i]);
            const answer = decoder.decodeAnswer();
            
            console.log(`Successfully decoded answer ${i}:`, answer);
            answers.push(answer);
            
          } catch (parseError) {
            console.warn(`Error parsing answer at index ${i}:`, parseError);
            continue;
          }
        }
        
        console.log(`Successfully parsed ${answers.length} answers from contract`);
        return answers;
      }
      
      console.log('No answers returned from contract');
      return [];
    } catch (error) {
      console.error('Error getting answers for question:', error);
      return [];
    }
  }

  async submitAnswer(questionId: string, title: string, description: string) {
    try {
      // Create the transaction data
      const data = `submitAnswer@${parseInt(questionId).toString(16).padStart(16, '0')}@${Buffer.from(title).toString('hex')}@${Buffer.from(description).toString('hex')}`;
      
      console.log('Submitting answer for question:', questionId);
      
      // Send the transaction using the dApp SDK
      const sessionId = await sendTransactions({
        transactions: [{
          receiver: this.contractAddress.bech32(),
          value: '0',
          data: data,
          gasLimit: 8000000, // 8M gas limit
        }],
        transactionsDisplayInfo: {
          processingMessage: 'Submitting answer to blockchain...',
          errorMessage: 'An error has occurred during submission',
          successMessage: 'Answer submitted successfully!'
        },
        redirectAfterSign: false,
      });

      return sessionId;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  async approveAnswer(questionId: string, answerId: string) {
    try {
      // Create the transaction data
      const data = `approveAnswer@${parseInt(questionId).toString(16).padStart(16, '0')}@${parseInt(answerId).toString(16).padStart(16, '0')}`;
      
      console.log('Approving answer:', { questionId, answerId });
      
      // Send the transaction using the dApp SDK
      const sessionId = await sendTransactions({
        transactions: [{
          receiver: this.contractAddress.bech32(),
          value: '0',
          data: data,
          gasLimit: 8000000, // 8M gas limit
        }],
        transactionsDisplayInfo: {
          processingMessage: 'Approving answer on blockchain...',
          errorMessage: 'An error has occurred during approval',
          successMessage: 'Answer approved successfully!'
        },
        redirectAfterSign: false,
      });

      return sessionId;
    } catch (error) {
      console.error('Error approving answer:', error);
      throw error;
    }
  }

  async getAllOpenQuestions(): Promise<QuestionData[]> {
    try {
      const query = new Query({
        address: this.contractAddress,
        func: new ContractFunction('getAllOpenQuestions'),
        args: []
      });

      const response = await this.networkProvider.queryContract(query);
      
      if (response.returnData && response.returnData.length > 0) {
        console.log('Raw contract response:', response);
        
        const questions: QuestionData[] = [];

        // Each item in returnData represents a Question struct encoded in binary
        for (let i = 0; i < response.returnData.length; i++) {
          try {
            console.log(`Decoding question ${i} from base64:`, response.returnData[i]);
            
            const decoder = new MultiversXDecoder(response.returnData[i]);
            const question = decoder.decodeQuestion();
            
            console.log(`Successfully decoded question ${i}:`, question);
            questions.push(question);
            
          } catch (parseError) {
            console.warn(`Error parsing question at index ${i}:`, parseError);
            console.warn('Raw data was:', response.returnData[i]);
            
            // Skip malformed entries rather than stopping entirely
            continue;
          }
        }
        
        console.log(`Successfully parsed ${questions.length} questions from contract`);
        return questions;
      }
      
      console.log('No questions returned from contract');
      return [];
    } catch (error) {
      console.error('Error getting all open questions:', error);
      return [];
    }
  }

  async getQuestionsByStatus(status: QuestionStatus) {}

  async getExpiredQuestions() {}

}