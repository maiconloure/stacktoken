// SPDX-License-Identifier: MIT
#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

pub const MIN_EGLD_LOCKED: u64 = 100_000_000_000_000_000; // 0.1 EGLD in wei
pub mod stacktoken_proxy;

#[type_abi]
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, PartialEq, Debug)]
pub enum QuestionStatus {
    Created,
    Answered,
    AnswerApproved,
    Expired,
}

#[type_abi]
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct Question<M: ManagedTypeApi> {
    pub question_id: u64,
    pub creator: ManagedAddress<M>,
    pub title: ManagedBuffer<M>,
    pub description: ManagedBuffer<M>,
    pub deadline: u64,
    pub locked_amount: BigUint<M>,
    pub created_at: u64,
    pub status: QuestionStatus,
    pub approved_answer_id: Option<u64>,
}

#[type_abi]
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct Answer<M: ManagedTypeApi> {
    pub answer_id: u64,
    pub question_id: u64,
    pub creator: ManagedAddress<M>,
    pub title: ManagedBuffer<M>,
    pub description: ManagedBuffer<M>,
    pub created_at: u64,
    pub votes: u32,
    pub approved_by_creator: bool,
}

#[type_abi]
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct QuestionCreatedEventData<M: ManagedTypeApi> {
    pub deadline: u64,
    pub locked_amount: BigUint<M>,
}

#[multiversx_sc::contract]
pub trait StackTokenContract {
    #[init]
    fn init(&self) {
        let caller = self.blockchain().get_caller();
        self.owner().set(&caller);
        self.is_paused().set(false);
    }

    #[payable("EGLD")]
    #[endpoint(postQuestion)]
    fn post_question(
        &self,
        title: ManagedBuffer,
        description: ManagedBuffer,
        deadline: u64,
    ) {
        require!(!self.is_paused().get(), "Contract is paused");
        
        let caller = self.blockchain().get_caller();
        let payment = self.call_value().egld();
        require!(*payment >= BigUint::from(MIN_EGLD_LOCKED), "Insufficient EGLD");
        require!(!title.is_empty() && !description.is_empty(), "Title or description is empty");
        require!(deadline > self.blockchain().get_block_timestamp(), "Invalid deadline");

        let qid = self.question_id().update(|id| {
            *id += 1;
            *id
        });

        let question = Question {
            question_id: qid,
            creator: caller.clone(),
            title,
            description,
            deadline,
            locked_amount: payment.clone(),
            created_at: self.blockchain().get_block_timestamp(),
            status: QuestionStatus::Created,
            approved_answer_id: None,
        };

        self.questions(&qid).set(&question);
        self.user_questions(&caller).insert(qid);

        self.event_question_created(
            &qid,
            &caller,
            &QuestionCreatedEventData {
                deadline,
                locked_amount: payment.clone(),
            },
        );
    }

    #[endpoint(submitAnswer)]
    fn submit_answer(
        &self,
        question_id: u64,
        title: ManagedBuffer,
        description: ManagedBuffer,
    ) {
        require!(!self.is_paused().get(), "Contract is paused");
        
        let caller = self.blockchain().get_caller();
        let timestamp = self.blockchain().get_block_timestamp();

        let mut question = self.questions(&question_id).get();
        require!(question.status == QuestionStatus::Created || question.status == QuestionStatus::Answered, "Question is closed");
        require!(timestamp < question.deadline, "Question deadline passed");
        require!(caller != question.creator, "Creator cannot answer own question");

        let aid = self.answer_id().update(|id| {
            *id += 1;
            *id
        });

        let answer = Answer {
            answer_id: aid,
            question_id,
            creator: caller.clone(),
            title,
            description,
            created_at: timestamp,
            votes: 0,
            approved_by_creator: false,
        };

        self.answers(&aid).set(&answer);
        self.answers_by_question(&question_id).insert(aid);

        // Update question status to Answered if it was Created
        if question.status == QuestionStatus::Created {
            question.status = QuestionStatus::Answered;
            self.questions(&question_id).set(&question);
        }

        self.event_answer_submitted(&aid, &question_id, &caller);
    }

    #[endpoint(approveAnswer)]
    fn approve_answer(&self, question_id: u64, answer_id: u64) {
        let caller = self.blockchain().get_caller();
        let timestamp = self.blockchain().get_block_timestamp();

        let mut question = self.questions(&question_id).get();
        require!(caller == question.creator, "Only creator can approve");
        require!(timestamp >= question.deadline, "Cannot approve before deadline");
        require!(question.status == QuestionStatus::Created || question.status == QuestionStatus::Answered, "Question is already closed");

        let mut answer = self.answers(&answer_id).get();
        require!(answer.question_id == question_id, "Answer does not match question");

        question.status = QuestionStatus::AnswerApproved;
        question.approved_answer_id = Some(answer_id);
        answer.approved_by_creator = true;

        self.questions(&question_id).set(&question);
        self.answers(&answer_id).set(&answer);
        self.send().direct(
            &answer.creator,
            &EgldOrEsdtTokenIdentifier::egld(),
            0u64,
            &question.locked_amount,
        );

        self.event_answer_approved(&question_id, &answer_id, &answer.creator);
    }

    #[endpoint(refundQuestion)]
    fn refund_question(&self, question_id: u64) {
        let caller = self.blockchain().get_caller();
        let timestamp = self.blockchain().get_block_timestamp();
        let mut question = self.questions(&question_id).get();

        require!(caller == question.creator, "Only creator can refund");
        require!(timestamp >= question.deadline, "Deadline not reached");
        require!(question.status == QuestionStatus::Created || question.status == QuestionStatus::Answered, "Question already handled");

        question.status = QuestionStatus::Expired;
        self.questions(&question_id).set(&question);
        self.send().direct(
            &caller,
            &EgldOrEsdtTokenIdentifier::egld(),
            0u64,
            &question.locked_amount,
        );

        self.event_tokens_refunded(&question_id, &caller);
    }

    #[view(getAllOpenQuestions)]
    fn get_all_open_questions(&self) -> MultiValueEncoded<Question<Self::Api>> {
        let now = self.blockchain().get_block_timestamp();
        let mut results = MultiValueEncoded::new();
        let total_questions = self.question_id().get();
        
        for qid in 1..=total_questions {
            let question = self.questions(&qid).get();
            if (question.status == QuestionStatus::Created || question.status == QuestionStatus::Answered) && question.deadline > now {
                results.push(question);
            }
        }
        
        results
    }

    #[view(getQuestionDetails)]
    fn get_question_details(&self, question_id: u64) -> OptionalValue<Question<Self::Api>> {
        let mapper = self.questions(&question_id);
        if mapper.is_empty() {
            OptionalValue::None
        } else {
            OptionalValue::Some(mapper.get())
        }
    }

    #[view(getAnswersForQuestion)]
    fn get_answers_for_question(&self, question_id: u64) -> MultiValueEncoded<Answer<Self::Api>> {
        let answer_ids = self.answers_by_question(&question_id);
        answer_ids
            .iter()
            .filter_map(|aid| {
                let mapper = self.answers(&aid);
                if mapper.is_empty() {
                    None
                } else {
                    Some(mapper.get())
                }
            })
            .collect()
    }

    #[view(getQuestionsByStatus)]
    fn get_questions_by_status(&self, status: QuestionStatus) -> MultiValueEncoded<Question<Self::Api>> {
        let mut results = MultiValueEncoded::new();
        let total_questions = self.question_id().get();
        
        for qid in 1..=total_questions {
            let question = self.questions(&qid).get();
            if question.status == status {
                results.push(question);
            }
        }
        
        results
    }

    #[view(getExpiredQuestions)]
    fn get_expired_questions(&self) -> MultiValueEncoded<Question<Self::Api>> {
        let now = self.blockchain().get_block_timestamp();
        let mut results = MultiValueEncoded::new();
        let total_questions = self.question_id().get();
        
        for qid in 1..=total_questions {
            let question = self.questions(&qid).get();
            // Questions that have passed deadline and are still open (Created or Answered)
            if now >= question.deadline && 
               (question.status == QuestionStatus::Created || question.status == QuestionStatus::Answered) {
                results.push(question);
            }
        }
        
        results
    }

    // Helper function to check if a question should be marked as expired
    fn check_and_update_question_status(&self, question_id: u64) -> QuestionStatus {
        let now = self.blockchain().get_block_timestamp();
        let question = self.questions(&question_id).get();
        
        // If deadline passed and question is not closed, it's expired
        if now >= question.deadline && 
           (question.status == QuestionStatus::Created || question.status == QuestionStatus::Answered) {
            // Don't automatically change to expired - let creator decide to refund
            // Just return what the status should be for display purposes
            return QuestionStatus::Expired;
        }
        
        question.status
    }

    #[storage_mapper("questions")]
    fn questions(&self, question_id: &u64) -> SingleValueMapper<Question<Self::Api>>;

    #[storage_mapper("question_id")]
    fn question_id(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("answer_id")]
    fn answer_id(&self) -> SingleValueMapper<u64>;
    #[event("question_created")]
    fn event_question_created(
        &self,
        #[indexed] question_id: &u64,
        #[indexed] creator: &ManagedAddress,
        data: &QuestionCreatedEventData<Self::Api>,
    );

    #[storage_mapper("answers")]
    fn answers(&self, answer_id: &u64) -> SingleValueMapper<Answer<Self::Api>>;

    #[storage_mapper("answers_by_question")]
    fn answers_by_question(&self, qid: &u64) -> UnorderedSetMapper<u64>;

    #[storage_mapper("user_questions")]
    fn user_questions(&self, user: &ManagedAddress) -> UnorderedSetMapper<u64>;

    #[event("answer_submitted")]
    fn event_answer_submitted(
        &self,
        #[indexed] answer_id: &u64,
        #[indexed] question_id: &u64,
        #[indexed] creator: &ManagedAddress,
    );

    #[event("answer_approved")]
    fn event_answer_approved(
        &self,
        #[indexed] question_id: &u64,
        #[indexed] answer_id: &u64,
        #[indexed] rewarded_user: &ManagedAddress,
    );

    #[event("tokens_refunded")]
    fn event_tokens_refunded(
        &self,
        #[indexed] question_id: &u64,
        #[indexed] creator: &ManagedAddress,
    );

    // Owner management endpoints
    #[only_owner]
    #[endpoint(pauseContract)]
    fn pause_contract(&self) {
        self.is_paused().set(true);
        self.event_contract_paused();
    }

    #[only_owner]
    #[endpoint(unpauseContract)]
    fn unpause_contract(&self) {
        self.is_paused().set(false);
        self.event_contract_unpaused();
    }

    #[only_owner]
    #[endpoint(transferOwnership)]
    fn transfer_ownership(&self, new_owner: ManagedAddress) {
        let old_owner = self.owner().get();
        self.owner().set(&new_owner);
        self.event_ownership_transferred(&old_owner, &new_owner);
    }

    // View functions for contract status and statistics
    #[view(getOwner)]
    fn get_owner(&self) -> ManagedAddress {
        self.owner().get()
    }

    #[view(isPaused)]
    fn is_contract_paused(&self) -> bool {
        self.is_paused().get()
    }

    #[view(getTotalQuestions)]
    fn get_total_questions(&self) -> u64 {
        self.question_id().get()
    }

    #[view(getTotalAnswers)]
    fn get_total_answers(&self) -> u64 {
        self.answer_id().get()
    }

    #[view(getContractStats)]
    fn get_contract_stats(&self) -> MultiValue3<u64, u64, bool> {
        (
            self.question_id().get(),  // total questions
            self.answer_id().get(),    // total answers
            self.is_paused().get(),    // is paused
        ).into()
    }

    // Storage mappers for owner and pause functionality
    #[storage_mapper("owner")]
    fn owner(&self) -> SingleValueMapper<ManagedAddress>;

    #[storage_mapper("is_paused")]
    fn is_paused(&self) -> SingleValueMapper<bool>;

    // Events for ownership and pause functionality
    #[event("contract_paused")]
    fn event_contract_paused(&self);

    #[event("contract_unpaused")]
    fn event_contract_unpaused(&self);

    #[event("ownership_transferred")]
    fn event_ownership_transferred(
        &self,
        #[indexed] old_owner: &ManagedAddress,
        #[indexed] new_owner: &ManagedAddress,
    );
}
