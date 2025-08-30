// src/pages/GameConfigurations.tsx
import { useSocket } from "../contexts/socketContext";
import { useQuery } from "@tanstack/react-query";

import { Gamepad2, RefreshCw, Settings, Clock } from "lucide-react";
import { api } from "../utils/api";
import { Card } from "../components/cards";
import { Button } from "../components/button";

export const GameConfigurations = () => {
  const { games } = useSocket()

  const { refetch: reloadGames, isLoading: isReloading } = useQuery({
    queryKey: ['reload-games'],
    queryFn: () => api.post('/api/games/reload').then(res => res.data),
    enabled: false
  })

  const handleReloadGames = () => {
    reloadGames()
  }

  const getConfigTypeColor = (type: string) => {
    return type === 'steps' ? 'text-green-600 bg-green-100' : 'text-blue-600 bg-blue-100'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Game Configurations</h1>
        <Button 
          variant="secondary" 
          onClick={handleReloadGames}
          disabled={isReloading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isReloading ? 'animate-spin' : ''}`} />
          Reload Configs
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(games).map((game) => (
          <Card key={game.name}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Gamepad2 className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{game.name}</h3>
                
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Settings className="w-4 h-4 mr-2" />
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConfigTypeColor(game.config_type)}`}>
                      {game.config_type === 'steps' ? 'Step-based' : 'State Machine'}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>~{game.benchmark_duration}s benchmark</span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p><strong>Resolution:</strong> {game.resolution}</p>
                    <p><strong>Preset:</strong> {game.preset}</p>
                  </div>

                  <div className="text-xs text-gray-500 mt-3">
                    <p className="truncate" title={game.yaml_path}>
                      Config: {game.yaml_path.split('/').pop()}
                    </p>
                    {game.path && (
                      <p className="truncate mt-1" title={game.path}>
                        Game: {game.path.split('\\').pop() || game.path.split('/').pop()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {Object.keys(games).length === 0 && (
        <Card>
          <div className="text-center py-6">
            <Gamepad2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No game configurations found.</p>
            <p className="text-sm text-gray-400 mt-1">
              Place YAML configuration files in the config/games directory.
            </p>
            <Button className="mt-4" variant="secondary" onClick={handleReloadGames}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Scan for Configs
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
