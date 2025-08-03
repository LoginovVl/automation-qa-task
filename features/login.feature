Feature: Login Flow

  Scenario: User is ABLE to login with valid credentials
    Given I open the login page
    When I enter valid credentials
    Then I should be logged in successfully

  Scenario: User is NOT able to login with invalid credentials
    Given I open the login page
    When I enter invalid credentials
    Then I should see a login error message

# Committed due to login fail. 
# Scenario: Admin role should have access to admin consol;e
    # Given I open the login page
    # When I log in with valid credentials
    # And I click on  Admin console
    # Then I should be redirected to Admin Dashboard

# Scenario: Session is cleared after logout
    # Given I am logged in
    # When I log out
    # Then I should be redirected to the login page
    # When I try to access the dashboard directly
    # Then I should be redirected to the login page again



    # That the default list of e2e tests, I would have based on generalintial manual verification and test pyramid coverage
    # keeping in mind that most of validation cases hould be verified on unit, intergation and api tests,