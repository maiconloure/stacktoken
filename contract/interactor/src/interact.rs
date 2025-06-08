#![allow(non_snake_case)]

pub mod config;
mod proxy;

use config::Config;
use multiversx_sc_snippets::imports::*;
use proxy::{Question, Answer};
use serde::{Deserialize, Serialize};
use std::{
    io::{Read, Write},
    path::Path,
};

const STATE_FILE: &str = "state.toml";

pub async fn stacktoken_cli() {
    env_logger::init();

    let mut args = std::env::args();
    let _ = args.next();
    let cmd = args.next().expect("at least one argument required");
    let config = Config::new();
    let mut interact = ContractInteract::new(config).await;
    match cmd.as_str() {
        "deploy" => interact.deploy().await,
        "postQuestion" => interact.post_question().await,
        "submitAnswer" => interact.submit_answer().await,
        "approveAnswer" => interact.approve_answer().await,
        "refundQuestion" => interact.refund_question().await,
        "getAllOpenQuestions" => interact.get_all_open_questions().await,
        "getQuestionDetails" => interact.get_question_details().await,
        "getAnswersForQuestion" => interact.get_answers_for_question().await,
        "getQuestionsByStatus" => interact.get_questions_by_status().await,
        "getExpiredQuestions" => interact.get_expired_questions().await,
        "pauseContract" => interact.pause_contract().await,
        "unpauseContract" => interact.unpause_contract().await,
        "transferOwnership" => interact.transfer_ownership().await,
        "getOwner" => interact.get_owner().await,
        "isPaused" => interact.is_contract_paused().await,
        "getTotalQuestions" => interact.get_total_questions().await,
        "getTotalAnswers" => interact.get_total_answers().await,
        "getContractStats" => interact.get_contract_stats().await,
        _ => panic!("unknown command: {}", &cmd),
    }
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct State {
    contract_address: Option<Bech32Address>
}

impl State {
        // Deserializes state from file
        pub fn load_state() -> Self {
            if Path::new(STATE_FILE).exists() {
                let mut file = std::fs::File::open(STATE_FILE).unwrap();
                let mut content = String::new();
                file.read_to_string(&mut content).unwrap();
                toml::from_str(&content).unwrap()
            } else {
                Self::default()
            }
        }
    
        /// Sets the contract address
        pub fn set_address(&mut self, address: Bech32Address) {
            self.contract_address = Some(address);
        }
    
        /// Returns the contract address
        pub fn current_address(&self) -> &Bech32Address {
            self.contract_address
                .as_ref()
                .expect("no known contract, deploy first")
        }
    }
    
    impl Drop for State {
        // Serializes state to file
        fn drop(&mut self) {
            let mut file = std::fs::File::create(STATE_FILE).unwrap();
            file.write_all(toml::to_string(self).unwrap().as_bytes())
                .unwrap();
        }
    }

pub struct ContractInteract {
    interactor: Interactor,
    wallet_address: Address,
    contract_code: BytesValue,
    state: State
}

impl ContractInteract {
    pub async fn new(config: Config) -> Self {
        let mut interactor = Interactor::new(config.gateway_uri())
            .await
            .use_chain_simulator(config.use_chain_simulator());

        interactor.set_current_dir_from_workspace("stacktoken");
        let wallet_address = interactor.register_wallet(test_wallets::alice()).await;

        // Useful in the chain simulator setting
        // generate blocks until ESDTSystemSCAddress is enabled
        interactor.generate_blocks_until_epoch(1).await.unwrap();
        
        let contract_code = BytesValue::interpret_from(
            "mxsc:../output/stacktoken.mxsc.json",
            &InterpreterContext::default(),
        );

        ContractInteract {
            interactor,
            wallet_address,
            contract_code,
            state: State::load_state()
        }
    }

    pub async fn deploy(&mut self) {
        let new_address = self
            .interactor
            .tx()
            .from(&self.wallet_address)
            .gas(30_000_000u64)
            .typed(proxy::StackTokenContractProxy)
            .init()
            .code(&self.contract_code)
            .returns(ReturnsNewAddress)
            .run()
            .await;
        let new_address_bech32 = bech32::encode(&new_address);
        self.state
            .set_address(Bech32Address::from_bech32_string(new_address_bech32.clone()));

        println!("new address: {new_address_bech32}");
    }

    pub async fn post_question(&mut self) {
        let egld_amount = BigUint::<StaticApi>::from(0u128);

        let title = ManagedBuffer::new_from_bytes(&b""[..]);
        let description = ManagedBuffer::new_from_bytes(&b""[..]);
        let deadline = 0u64;

        let response = self
            .interactor
            .tx()
            .from(&self.wallet_address)
            .to(self.state.current_address())
            .gas(30_000_000u64)
            .typed(proxy::StackTokenContractProxy)
            .post_question(title, description, deadline)
            .egld(egld_amount)
            .returns(ReturnsResultUnmanaged)
            .run()
            .await;

        println!("Result: {response:?}");
    }

    pub async fn submit_answer(&mut self) {
        let question_id = 0u64;
        let title = ManagedBuffer::new_from_bytes(&b""[..]);
        let description = ManagedBuffer::new_from_bytes(&b""[..]);

        let response = self
            .interactor
            .tx()
            .from(&self.wallet_address)
            .to(self.state.current_address())
            .gas(30_000_000u64)
            .typed(proxy::StackTokenContractProxy)
            .submit_answer(question_id, title, description)
            .returns(ReturnsResultUnmanaged)
            .run()
            .await;

        println!("Result: {response:?}");
    }

    pub async fn approve_answer(&mut self) {
        let question_id = 0u64;
        let answer_id = 0u64;

        let response = self
            .interactor
            .tx()
            .from(&self.wallet_address)
            .to(self.state.current_address())
            .gas(30_000_000u64)
            .typed(proxy::StackTokenContractProxy)
            .approve_answer(question_id, answer_id)
            .returns(ReturnsResultUnmanaged)
            .run()
            .await;

        println!("Result: {response:?}");
    }

    pub async fn refund_question(&mut self) {
        let question_id = 0u64;

        let response = self
            .interactor
            .tx()
            .from(&self.wallet_address)
            .to(self.state.current_address())
            .gas(30_000_000u64)
            .typed(proxy::StackTokenContractProxy)
            .refund_question(question_id)
            .returns(ReturnsResultUnmanaged)
            .run()
            .await;

        println!("Result: {response:?}");
    }

    pub async fn get_all_open_questions(&mut self) {
        let result_value = self
            .interactor
            .query()
            .to(self.state.current_address())
            .typed(proxy::StackTokenContractProxy)
            .get_all_open_questions()
            .returns(ReturnsResultUnmanaged)
            .run()
            .await;

        let questions_vec: Vec<Question<StaticApi>> = result_value.into_vec();
        println!("Found {} open questions:", questions_vec.len());
        
        if questions_vec.is_empty() {
            println!("No open questions found.");
            return;
        }
        
        for (index, question) in questions_vec.iter().enumerate() {
            println!("Question {}:", index + 1);
            println!("  ID: {}", question.question_id);
            println!("  Title: {}", question.title.to_string());
            println!("  Description: {}", question.description.to_string());
            println!("  Creator: {}", bech32::encode(&question.creator.to_address()));
            println!("  Deadline: {}", question.deadline);
            println!("  Locked Amount: {:?}", question.locked_amount);
            println!("  Created At: {}", question.created_at);
            println!("  Status: {:?}", question.status);
            if let Some(approved_id) = question.approved_answer_id {
                println!("  Approved Answer ID: {}", approved_id);
            }
            println!("  ---");
        }
    }

    pub async fn get_question_details(&mut self) {
        let question_id = 0u64; // You can modify this to accept a parameter or read from input

        let result_value = self
            .interactor
            .query()
            .to(self.state.current_address())
            .typed(proxy::StackTokenContractProxy)
            .get_question_details(question_id)
            .returns(ReturnsResultUnmanaged)
            .run()
            .await;

        match result_value.into_option() {
            Some(question) => {
                println!("Question Details:");
                println!("  ID: {}", question.question_id);
                println!("  Title: {}", question.title.to_string());
                println!("  Description: {}", question.description.to_string());
                println!("  Creator: {}", bech32::encode(&question.creator.to_address()));
                println!("  Deadline: {}", question.deadline);
                println!("  Locked Amount: {:?}", question.locked_amount);
                println!("  Created At: {}", question.created_at);
                println!("  Status: {:?}", question.status);
                if let Some(approved_id) = question.approved_answer_id {
                    println!("  Approved Answer ID: {}", approved_id);
                }
            }
            None => {
                println!("Question with ID {} not found", question_id);
            }
        }
    }

    pub async fn get_answers_for_question(&mut self) {
        let question_id = 0u64; // You can modify this to accept a parameter or read from input

        let result_value = self
            .interactor
            .query()
            .to(self.state.current_address())
            .typed(proxy::StackTokenContractProxy)
            .get_answers_for_question(question_id)
            .returns(ReturnsResultUnmanaged)
            .run()
            .await;

        let answers_vec: Vec<Answer<StaticApi>> = result_value.into_vec();
        println!("Found {} answers for question ID {}:", answers_vec.len(), question_id);
        
        if answers_vec.is_empty() {
            println!("No answers found for this question.");
            return;
        }
        
        for (index, answer) in answers_vec.iter().enumerate() {
            println!("Answer {}:", index + 1);
            println!("  Answer ID: {}", answer.answer_id);
            println!("  Question ID: {}", answer.question_id);
            println!("  Title: {}", answer.title.to_string());
            println!("  Description: {}", answer.description.to_string());
            println!("  Creator: {}", bech32::encode(&answer.creator.to_address()));
            println!("  Created At: {}", answer.created_at);
            println!("  Votes: {}", answer.votes);
            println!("  Approved by Creator: {}", answer.approved_by_creator);
            println!("  ---");
        }
    }

    pub async fn get_questions_by_status(&mut self) {
        // let status = QuestionStatus::<StaticApi>::default();

        // let result_value = self
        //     .interactor
        //     .query()
        //     .to(self.state.current_address())
        //     .typed(proxy::StackTokenContractProxy)
        //     .get_questions_by_status(status)
        //     .returns(ReturnsResultUnmanaged)
        //     .run()
        //     .await;

        println!("Result");
    }

    pub async fn get_expired_questions(&mut self) {
        // let result_value = self
        //     .interactor
        //     .query()
        //     .to(self.state.current_address())
        //     .typed(proxy::StackTokenContractProxy)
        //     .get_expired_questions()
        //     .returns(ReturnsResultUnmanaged)
        //     .run()
        //     .await;

        println!("Result");
    }

    pub async fn pause_contract(&mut self) {
        let response = self
            .interactor
            .tx()
            .from(&self.wallet_address)
            .to(self.state.current_address())
            .gas(30_000_000u64)
            .typed(proxy::StackTokenContractProxy)
            .pause_contract()
            .returns(ReturnsResultUnmanaged)
            .run()
            .await;

        println!("Result: {response:?}");
    }

    pub async fn unpause_contract(&mut self) {
        let response = self
            .interactor
            .tx()
            .from(&self.wallet_address)
            .to(self.state.current_address())
            .gas(30_000_000u64)
            .typed(proxy::StackTokenContractProxy)
            .unpause_contract()
            .returns(ReturnsResultUnmanaged)
            .run()
            .await;

        println!("Result: {response:?}");
    }

    pub async fn transfer_ownership(&mut self) {
        let new_owner = bech32::decode("");

        let response = self
            .interactor
            .tx()
            .from(&self.wallet_address)
            .to(self.state.current_address())
            .gas(30_000_000u64)
            .typed(proxy::StackTokenContractProxy)
            .transfer_ownership(new_owner)
            .returns(ReturnsResultUnmanaged)
            .run()
            .await;

        println!("Result: {response:?}");
    }

    pub async fn get_owner(&mut self) {
        let result_value = self
            .interactor
            .query()
            .to(self.state.current_address())
            .typed(proxy::StackTokenContractProxy)
            .get_owner()
            .returns(ReturnsResultUnmanaged)
            .run()
            .await;

        println!("Result: {result_value:?}");
    }

    pub async fn is_contract_paused(&mut self) {
        let result_value = self
            .interactor
            .query()
            .to(self.state.current_address())
            .typed(proxy::StackTokenContractProxy)
            .is_contract_paused()
            .returns(ReturnsResultUnmanaged)
            .run()
            .await;

        println!("Result: {result_value:?}");
    }

    pub async fn get_total_questions(&mut self) {
        let result_value = self
            .interactor
            .query()
            .to(self.state.current_address())
            .typed(proxy::StackTokenContractProxy)
            .get_total_questions()
            .returns(ReturnsResultUnmanaged)
            .run()
            .await;

        println!("Result: {result_value:?}");
    }

    pub async fn get_total_answers(&mut self) {
        let result_value = self
            .interactor
            .query()
            .to(self.state.current_address())
            .typed(proxy::StackTokenContractProxy)
            .get_total_answers()
            .returns(ReturnsResultUnmanaged)
            .run()
            .await;

        println!("Result: {result_value:?}");
    }

    pub async fn get_contract_stats(&mut self) {
        let result_value = self
            .interactor
            .query()
            .to(self.state.current_address())
            .typed(proxy::StackTokenContractProxy)
            .get_contract_stats()
            .returns(ReturnsResultUnmanaged)
            .run()
            .await;

        println!("Result: {result_value:?}");
    }

}
