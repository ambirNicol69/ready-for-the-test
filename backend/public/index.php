<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/config/database.php';
require_once __DIR__ . '/../src/middlewares/error-handler.php';
require_once __DIR__ . '/../src/utils/json-response.php';
require_once __DIR__ . '/../src/utils/exceptions.php';
require_once __DIR__ . '/../src/utils/http-helpers.php';
require_once __DIR__ . '/../src/utils/token.php';
require_once __DIR__ . '/../src/utils/validators.php';
require_once __DIR__ . '/../src/models/user.php';
require_once __DIR__ . '/../src/models/calculator-operation.php';
require_once __DIR__ . '/../src/models/lab-sample.php';
require_once __DIR__ . '/../src/models/known-substance.php';
require_once __DIR__ . '/../src/models/reagent.php';
require_once __DIR__ . '/../src/models/mixture-reaction.php';
require_once __DIR__ . '/../src/models/lab-experiment.php';
require_once __DIR__ . '/../src/models/quiz-room.php';
require_once __DIR__ . '/../src/models/quiz-question.php';
require_once __DIR__ . '/../src/models/quiz-question-option.php';
require_once __DIR__ . '/../src/models/quiz-attempt.php';
require_once __DIR__ . '/../src/repositories/user-repository.php';
require_once __DIR__ . '/../src/repositories/calculator-operation-repository.php';
require_once __DIR__ . '/../src/repositories/lab-sample-repository.php';
require_once __DIR__ . '/../src/repositories/known-substance-repository.php';
require_once __DIR__ . '/../src/repositories/reagent-repository.php';
require_once __DIR__ . '/../src/repositories/mixture-reaction-repository.php';
require_once __DIR__ . '/../src/repositories/discovered-reaction-repository.php';
require_once __DIR__ . '/../src/repositories/lab-experiment-repository.php';
require_once __DIR__ . '/../src/repositories/quiz-room-repository.php';
require_once __DIR__ . '/../src/repositories/quiz-question-repository.php';
require_once __DIR__ . '/../src/repositories/quiz-attempt-repository.php';
require_once __DIR__ . '/../src/services/auth-service.php';
require_once __DIR__ . '/../src/services/calculator-operation-service.php';
require_once __DIR__ . '/../src/services/lab-experiment-service.php';
require_once __DIR__ . '/../src/services/lab-sample-service.php';
require_once __DIR__ . '/../src/services/lab-mixing-service.php';
require_once __DIR__ . '/../src/services/lab-identification-service.php';
require_once __DIR__ . '/../src/services/lab-catalog-service.php';
require_once __DIR__ . '/../src/services/quiz-room-service.php';
require_once __DIR__ . '/../src/services/quiz-auto-service.php';
require_once __DIR__ . '/../src/services/assistant-service.php';
require_once __DIR__ . '/../src/controllers/auth-controller.php';
require_once __DIR__ . '/../src/controllers/calculator-operation-controller.php';
require_once __DIR__ . '/../src/controllers/lab-sample-controller.php';
require_once __DIR__ . '/../src/controllers/lab-mixing-controller.php';
require_once __DIR__ . '/../src/controllers/lab-identification-controller.php';
require_once __DIR__ . '/../src/controllers/lab-catalog-controller.php';
require_once __DIR__ . '/../src/controllers/lab-experiment-controller.php';
require_once __DIR__ . '/../src/controllers/quiz-room-controller.php';
require_once __DIR__ . '/../src/controllers/assistant-controller.php';
require_once __DIR__ . '/../src/controllers/classroom-controller.php';
require_once __DIR__ . '/../src/controllers/lesson-progress-controller.php';
require_once __DIR__ . '/../src/controllers/profile-customization-controller.php';
require_once __DIR__ . '/../src/controllers/minigame-controller.php';
require_once __DIR__ . '/../src/middlewares/auth-middleware.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $tokenSecret = getenv('TOKEN_SECRET') ?: '';
    $database = getDatabaseConnection();

    $userRepository = new UserRepository($database);
    $authService = new AuthService($userRepository, $tokenSecret);
    $authController = new AuthController($authService);
    $authMiddleware = new AuthMiddleware($userRepository, $tokenSecret);

    $calculatorOperationController = new CalculatorOperationController(
        new CalculatorOperationService(new CalculatorOperationRepository($database))
    );

    $labExperimentService = new LabExperimentService(
        new LabExperimentRepository($database),
        $userRepository
    );

    $labSampleController = new LabSampleController(
        new LabSampleService(new LabSampleRepository($database), $labExperimentService)
    );

    $labCatalogService = new LabCatalogService(
        new KnownSubstanceRepository($database),
        new ReagentRepository($database),
        new MixtureReactionRepository($database)
    );
    $labCatalogController = new LabCatalogController($labCatalogService);

    $labMixingController = new LabMixingController(
        new LabMixingService(
            new MixtureReactionRepository($database),
            new DiscoveredReactionRepository($database),
            new ReagentRepository($database),
            $labExperimentService
        )
    );

    $labIdentificationController = new LabIdentificationController(
        new LabIdentificationService(
            new KnownSubstanceRepository($database),
            $labExperimentService
        )
    );

    $labExperimentController = new LabExperimentController($labExperimentService);

    $quizRoomService = new QuizRoomService(
        new QuizRoomRepository($database),
        new QuizQuestionRepository($database),
        new QuizAttemptRepository($database),
        $userRepository
    );

    $quizRoomController = new QuizRoomController(
        $quizRoomService,
        new QuizAutoService($quizRoomService)
    );

    $classroomController = new ClassroomController($database);
    $lessonProgressController = new LessonProgressController($database);
    $profileCustomizationController = new ProfileCustomizationController($database);
    $minigameController = new MinigameController($database);

    $assistantController = new AssistantController(
        new AssistantService(
            new CalculatorOperationRepository($database),
            new LabSampleRepository($database),
            new LabExperimentRepository($database),
            new DiscoveredReactionRepository($database),
            new QuizAttemptRepository($database)
        )
    );

    require __DIR__ . '/../src/routes/api-routes.php';
} catch (Throwable $error) {
    handleApiError($error);
}
