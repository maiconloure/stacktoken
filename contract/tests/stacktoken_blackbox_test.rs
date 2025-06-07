use stacktoken::stacktoken_proxy;
use multiversx_sc_scenario::imports::*;

const CODE_PATH: MxscPath = MxscPath::new("output/stacktoken.mxsc.json");

fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();

    blockchain.set_current_dir_from_workspace("stacktoken");
    blockchain.register_contract(CODE_PATH, stacktoken::ContractBuilder);
    blockchain
}

const OWNER: TestAddress = TestAddress::new("owner");
const STACKTOKEN_ADDRESS: TestSCAddress = TestSCAddress::new("stacktoken");

fn stacktoken_deploy() -> ScenarioWorld {
    let mut world = world();

    world.account(OWNER).nonce(0).balance(1_000_000);

    let stacktoken_address = world
        .tx()
        .from(OWNER)
        .typed(stacktoken_proxy::StackTokenContractProxy)
        .init()
        .code(CODE_PATH)
        .new_address(STACKTOKEN_ADDRESS)
        .returns(ReturnsNewAddress)
        .run();

    assert_eq!(stacktoken_address, STACKTOKEN_ADDRESS.to_address());

    world
}

#[test]
fn stacktoken_deploy_test() {
    let _world = stacktoken_deploy();
    
    // If we reach this point, the deployment was successful
    // The assert_eq! in stacktoken_deploy() already verifies the address
}

#[test]
fn stacktoken_deploy_and_basic_query_test() {
    let mut world = stacktoken_deploy();
    
    // Test that we can call a view function after deployment
    // This verifies the contract is properly deployed and functional
    world
        .query()
        .to(STACKTOKEN_ADDRESS)
        .typed(stacktoken_proxy::StackTokenContractProxy)
        .get_all_open_questions()
        .run();
    
    // If we reach this point, the query was successful
}